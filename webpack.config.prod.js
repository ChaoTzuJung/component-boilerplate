import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import atImport from 'postcss-import';
import postcssPresetEnv from 'postcss-preset-env';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';

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

const terserProductionOptions = {
	terserOptions: {
		ecma: 5,
		parse: {},
		compress: {
			warnings: false,
			// Disabled because of an issue with Uglify breaking seemingly valid code
			comparisons: false,
		},
		mangle: true,
		output: {
			comments: false,
			// Turned on true because emoji and regex is not minified properly using default
			ascii_only: true,
		},
	},
	// Use multi-process parallel running to improve the build speed
	parallel: true,
	// Enable file caching
	cache: true,
	// 設置為 source-map會生成很大的*.js.map文件 ，prod 設成false或cheap-module-source-map可以降低容量
	sourceMap: false,
};

const webpackProdConfig = {
	mode: process.env.NODE_ENV,
	devtool: 'cheap-module-source-map',
	entry: {
		context: path.resolve(__dirname, 'src'),
		app: './index.js',
	},
	output: {
		path: path.join(__dirname, 'dist'),
		// [name]會依照entry的name來更改output
		filename: '[name].[chunkhash].js',
		// 有require的靜態資源(例如：CSS)，設完整路徑
		publicPath: '/',
	},
	plugins: [
		// 定義環境變數
		new webpack.DefinePlugin({
			// TODO: JSON.stringify 讓字串統一變雙引號
			'process.env.NODE_ENV': JSON.stringify('production'),
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			chunksSortMode: 'dependency',
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html', // 以 index.html 這支檔案當作模版注入 html
			// mode 是 'production' 預設是 true，不然預設是 false
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeScriptTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
			inject: true, // Inject all assets into the given template html ,true 是 inject到 'body', false 是 'head'
			showErrors: false, // Errors details will be written into the HTML page
			filename: 'index.html',
			chunksSortMode: 'dependency', // Allows to control how chunks should be sorted before they are included to the HTML.
		}),
		// Webpack 4 以前使使用 extract-text-webpack-plugin；Webpack 4 之後則是使用 mini-css-extract-plugin。
		new MiniCssExtractPlugin({
			filename: '[name].[hash].css',
			chunkFilename: '[id].[hash].css',
		}),
		// HashedModuleIdsPlugin 的作用和 NamedChunksPlugin 是一樣的，只不過 HashedModuleIdsPlugin 把根據模塊相對路徑生成的 hash 作為 chunk id，這樣 chunk id 會更短
		new webpack.HashedModuleIdsPlugin(),
	],
	optimization: {
		minimizer: [
			new TerserPlugin(
				process.env.NODE_ENV === 'production' ? terserProductionOptions : terserDevOptions,
			),
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
					name(module) {
						// get the name. E.g. node_modules/packageName/not/this/part.js
						// or node_modules/packageName
						const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

						// npm package names are URL-safe, but some servers don't like @ symbols
						return `npm.${packageName.replace('@', '')}`;
					},
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
				include: [path.join(__dirname, 'src')],
				exclude: path.join(__dirname, 'node_modules'),
				loader: 'babel-loader',
				options: {
					presets: [
						['@babel/preset-env', { loose: true, modules: false, useBuiltIns: 'usage', corejs: 2 }],
						'@babel/preset-react',
					],
					plugins: [
						['module-resolver', { root: ['./src'] }],
						'@babel/plugin-syntax-dynamic-import',
						'@babel/plugin-syntax-import-meta',
						'@babel/plugin-proposal-class-properties',
						'@babel/plugin-proposal-json-strings',
						'@babel/plugin-transform-react-constant-elements',
					],
					babelrc: false,
				},
			},
			{
				test: /\.css$/,
				include: path.join(__dirname, 'src'),
				use: [
					// 在 webpack 4 中 prod 用 MiniCssExtractPlugin.loader, dev 用 style-loader
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						// https://www.html.cn/doc/webpack2/loaders/css-loader/
						options: {
							// 啟用 Sourcemaps (會增加了 bundle 的大小 (JS SourceMap 不會))
							sourceMap: process.env.NODE_ENV !== 'production',
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
							sourceMap: process.env.NODE_ENV !== 'production' ? 'inline' : false,
							plugins: () => [
								// transform @import rules by inlining content.
								atImport(),
								postcssPresetEnv({
									// determines which CSS features to polyfill, 0 (experimental) -> 4 (stable)
									stage: 0,
									// TODO: specifies sources (Custom Media, Custom Properties, Custom Selectors, and Environment Variables)
									// importFrom: [
									// 	{
									// 		customMedia: media,
									// 		customProperties: palette,
									// 	},
									// ],
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
				include: path.join(__dirname, 'node_modules'),
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: process.env.NODE_ENV !== 'production',
						},
					},
				],
			},
			{
				test: /\.(jpe?g|png|gif)$/,
				include: path.join(__dirname, 'src'),
				// 判斷圖片的檔案大小。如果檔案太大，它會將圖片保持在我們輸出檔案的資料夾裡；反之若圖片的檔案小於我們設定的大小， url-loader 會它編譯為 Base64 的字串並直接插入我們的 JavaScritp 裡面。
				loader: 'url-loader',
				options: {
					// 如果檔案小於 10KB
					limit: 10000,
					// ext 是 extension 副檔名
					name: './assets/[name]__[hash].[ext]',
				},
			},
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
			{
				test: /\.inline.svg$/,
				include: path.join(__dirname, 'src'),
				loader: '@svgr/webpack',
				options: {
					svgoConfig: {
						// don't remove unused IDs and minify remaining IDs
						// don't remove viewBox when possible (default)
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
	resolve: {
		// resolve.modules配置webpack去哪些目錄下尋找第三方模塊
		modules: ['node_modules'],
	}
}

// Minify and optimize the CSS
if (process.env.NODE_ENV === 'production') {
	// 之前直接使用 minimize: true 在匹配到css後直接壓縮，會導致添加的前綴丟失
	webpackProdConfig.plugins.push(new OptimizeCSSAssetsPlugin({}));
	// 對JS文件進行gzip壓縮，壓縮後為*.js.gz
	webpackProdConfig.plugins.push(new CompressionPlugin({ test: /\.(js|css|html)$/ }));
}

export default webpackProdConfig;
