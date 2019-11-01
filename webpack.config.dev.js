import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import atImport from 'postcss-import';
// 提供更多樣化的設置...code split 部分做更動
import postcssPresetEnv from 'postcss-preset-env';
import TerserPlugin from 'terser-webpack-plugin';

import env from './config/env';
import endpoint from './config/endpoint';
import palette from './config/palette';
import media from './config/media';

const terserDevOptions = {
	terserOptions: {
		ecma: 5,
		compress: {
			warnings: false,
			comparisons: false,
		},
		output: {
			comments: false,
			ascii_only: false,
		},
	},
};

export default {
	mode: process.env.NODE_ENV,
	devtool: 'cheap-module-eval-source-map',
	entry: {
		// webpack-hot-middleware/client(讓entry可以hot reload) 與 react-hot-loader/patch ?
		app: ['webpack-hot-middleware/client', 'react-hot-loader/patch', './src/index.js'],
	},
	output: {
		path: path.join(__dirname, 'dist'),
		// [name]會依照entry的name來更改output
		filename: '[name].bundle.js',
		// 有require的靜態資源(例如：CSS)，設完整路徑
		publicPath: '/',
	},
	plugins: [
		// 在你的自定義 server 或應用程序上啟用 HMR
		new webpack.HotModuleReplacementPlugin(),
		// 定義環境變數
		new webpack.DefinePlugin({
			'process.env': { ...env, ...endpoint },
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html', // 以 index.html 這支檔案當作模版注入 html
			chunksSortMode: 'dependency', // Allows to control how chunks should be sorted before they are included to the HTML.
		}),
	],
	optimization: {
		minimizer: [
			// UglifyJsPlugin不支持es6語法(需要配合babel先轉下)，改使用TerserPlugin
			new TerserPlugin(terserDevOptions),
		],
		// Code Splitting - 在這裡使用 SplitChunksPlugin
		// 在 Webpack v4 之後，移除了 CommonsChunkPlugin，採用 optimization.splitChunks
		splitChunks: {
			chunks: 'all',
			maxInitialRequests: Infinity,
			minSize: 0,
			// 把所有 node_modules 內的程式碼打包成一支 vendors.bundle.js
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: 'vendors',
					chunks: 'all',
				},
			},
		},
		// if runtimeChunk: true' or 'mutiple' -> adds an additional chunk to each entrypoint containing only the runtime
		// if runtimeChunk: 'false' or 'single' -> instead creates a runtime file to be shared for all generated chunks
		runtimeChunk: {
			name: 'runtime' // Default is false: each entry chunk embeds runtime.
		}
	},
	module: {
		rules: [
			{
				test: /\.js?$/,
				include: path.join(__dirname, 'src'),
				exclude: path.join(__dirname, 'node_modules'),
				loader: 'babel-loader',
				// https://nereuseng.github.io/2018/11/27/babel-usage/
				options: {
					presets: [
						// useBuiltIns 有 "usage" | "entry" | false
						['@babel/preset-env', { loose: true, modules: false, useBuiltIns: 'usage', corejs: 2 }],
						'@babel/preset-react',
					],
					plugins: [
						'react-hot-loader/babel',
						['module-resolver', { root: ['./src'] }],
						'@babel/plugin-syntax-dynamic-import',
						'@babel/plugin-syntax-import-meta',
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-json-strings',
						'@babel/plugin-transform-react-constant-elements',
					],
					//  babel-loader not reads from .babelrc file
					babelrc: false,
				},
			},
			{
				test: /\.css$/,
				include: path.join(__dirname, 'src'),
				use: [
					// 在 webpack 4 中 prod 用 MiniCssExtractPlugin.loader, dev 用 style-loader
					'style-loader',
					{
						// https://www.html.cn/doc/webpack2/loaders/css-loader/
						loader: 'css-loader',
						options: {
							// 啟用 Sourcemaps(會增加了 bundle 的大小 (JS SourceMap 不會))
							sourceMap: true,
							// 導出以駝峰化命名的類名（CSS寫 .class-name，JS自動看懂 className）
							camelCase: true,
							// 啟用 css-modules 模式
							modules: true,
							// 在 css-loader 前應用的 loader 的數，default 是 0
							importLoaders: 1,
							localIdentName: '[name]__[local]___[hash:base64:5]',
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: 'inline',
							plugins: () => [
								// transform @import rules by inlining content.
								atImport(),
								postcssPresetEnv({
									// determines which CSS features to polyfill, 0 (experimental) -> 4 (stable)
									stage: 0,
									// specifies sources (Custom Media, Custom Properties, Custom Selectors, and Environment Variables)
									importFrom: [
										{
											customMedia: media,
											customProperties: palette,
										},
									],
									// instruct all plugins to omit pre-polyfilled CSS
									preserve: false,
								}),
							],
						},
					},
				],
			},
			{
				test: /\.css$/,
				// 處理第三方套件的css EX: bootstrap 或 normalize.css
				include: path.join(__dirname, 'node_modules'),
				use: [
					{ loader: 'style-loader', options: { sourceMap: true } }, // 會將css放入js中去執行，就
					{ loader: 'css-loader', options: { sourceMap: true } },
				],
			},
			{
				test: /\.(jpe?g|png|gif)$/,
				include: path.join(__dirname, 'src'),
				// 判斷圖片的檔案大小。如果檔案太大，它會將圖片保持在我們輸出檔案的資料夾裡；反之若圖片的檔案小於我們設定的大小， url-loader 會它編譯為 Base64 的字串並直接插入我們的 JavaScritp 裡面。
				loader: 'url-loader',
				options: {
					// 如果檔案小於 10KB，將檔案編成字串 base64，大於則使用file-loader處理圖片
					limit: 10000,
					// ext 是 extension 副檔名
					name: './assets/[name]__[hash].[ext]',
				},
			},
			// 給src吃的一般svg圖片
			{
				test: /^(?!.*\.inline\.svg$).*\.svg$/,
				include: path.join(__dirname, 'src'),
				use: [
					'@svgr/webpack',
					{
						loader: 'url-loader',
						options: {
							limit: 10000,
							name: './assets/[name]__[hash].[ext]',
						},
					},
				],
			},
			// 給前端引入svg當作component的
			{
				test: /\.inline.svg$/,
				include: path.join(__dirname, 'src'),
				loader: '@svgr/webpack',
				options: {
					svgoConfig: {
						plugins: [{ cleanupIDs: false }, { removeViewBox: false }],
					},
				},
			},
		],
	},
	// If you are running your webpack bundle in nodejs environment then target: 'node' is required in webpack.config.js file otherwise webpack takes default value as web for target
	// https://stackoverflow.com/questions/39249237/node-cannot-find-module-fs-when-using-webpack
	node: {
		fs: 'empty',
	},
	// webpack在啟動後會從配置的入口模塊觸發找出所有依賴的模塊，Resolve配置webpack如何尋找模塊對應的文件。
	// https://segmentfault.com/a/1190000013176083
	resolve: {
		// resolve.modules配置webpack去哪些目錄下尋找第三方模塊
		// override the default resolve modules option which is If you want webpack to find modules not in your bundles folder but in your node modules folder
		modules: ['node_modules'],
		// resolve.alias配置項通過別名來把原來導入路徑映射成一個新的導入路徑
		alias: {
			// React項目中使用hot-react-loader 要修改webpack
			// https://www.cnblogs.com/hughes5135/p/10609301.html
			// 'react-dom': '@hot-loader/react-dom',
		},
	}
}
