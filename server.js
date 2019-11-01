import webpack from 'webpack';
import express from 'express';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
// 通過HTML5的history API的時候，使用NodeJS後端應該如何配置: https://blog.lsqy.space/2017/03/28/170328单页面应用的History路由模式express后端中间件配合/
import history from 'connect-history-api-fallback';
import httpProxy from 'http-proxy';

import config from './webpack.config.dev';
import { HOST_MAP } from './config/endpoint';

const host = HOST_MAP[process.env.PROXY];
const app = express();
// webpack(options, callback) 用於編譯打包源文件，並構建一個 編譯器 - compiler
// options: entry、 optimization、resolve、output
const compiler = webpack(config);

app.use(history());

// webpack-dev-server + HotModuleReplacementPlugin插件 = webpack-dev-middleware + webpack-hot-middleware = 達成 hot reload
// webpack-dev-middleware: 它可以把 webpack 處理後的文件傳遞給一個服務器(server)。
// Tell express to use the webpack-dev-middleware and use the webpack.config.js(compiler) configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
	// publicPath路徑下的打包文件可以在瀏覽器中訪問，打包後的資源對外的的根目錄就是publicPath
	publicPath: config.output.publicPath,
	stats: {
		chunks: false,
		colors: true,
	},
}));

// 在你的自定義 server 或應用程序上啟用 HMR
app.use(webpackHotMiddleware(compiler));

// 使用靜態資源目錄，才能訪問到 /dist/idndex.html
app.use(express.static(config.output.path))

// Serve the files on port 3000.
app.listen(3000, err => {
	if (err) {
		return console.error(err);
	}

	const proxyServer = httpProxy.createProxyServer({
		target: host,
		changeOrigin: true,
	});

	proxyServer.on('proxyReq', proxyReq => {
		proxyReq.setHeader('Origin', host);
	});

	proxyServer.on('proxyRes', proxyRes => {
		proxyRes.headers['Access-Control-Allow-Headers'] = 'content-type, authorization';
		proxyRes.headers['Access-Control-Allow-Methods'] = 'PUT, POST, GET, DELETE';
		proxyRes.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
	});

	// process.env.PROXY: dev / demo / production
	// host: http://localhost:9000 / http://25sprout.25demo.com / http://25sprout.com
	console.log(`Proxy ${process.env.PROXY} server ${host} start at localhost:9000`);

	proxyServer.listen(9000);
	return console.log('Listening at http://localhost:3000/');
});
