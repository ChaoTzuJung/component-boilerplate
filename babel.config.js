// babel 7 簡單升級指南: https://www.itread01.com/content/1543305972.html
// 此檔案跟 webpack內的babel做不同的事，這只給node執行，cammand line要帶參數

const babelConfigForWebpackBuild = {
	presets: [
		[
			// polyfill已經被整合在裡面，不用自己在整合，所以用 usage 而不是 entry 讓你可以不用在 src/index.js import '@babel/polyfill';
			'@babel/preset-env',
			{
				loose: true,
				useBuiltIns: 'usage',
				corejs: 3,
			},
		],
	],
	// Stage 3
	plugins: [
		// 讓import檔案的路徑少寫很多 ../../componeny
		['module-resolver', { root: ['./src'] }],
		'@babel/plugin-syntax-dynamic-import', // 動態import加載
		'@babel/plugin-syntax-import-meta', // Allow parsing of import.meta
		'@babel/plugin-proposal-class-properties', // 解析Class的屬性
		'@babel/plugin-proposal-json-strings',
	],
};

const babelConfigForJest = {
	presets: [
		[
			'@babel/preset-env',
			{
				loose: true,
				useBuiltIns: 'usage',
				corejs: 3,
				// webpack offers multiple deployment targets(server(node) or browser(web))
				targets: {
					node: 'current',
				},
			},
		],
	],
	plugins: [
		['module-resolver', { root: ['./src'] }],
		'@babel/plugin-syntax-dynamic-import',
		'@babel/plugin-syntax-import-meta',
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-proposal-json-strings',
	],
};

module.exports = api => {
	const isTest = api.env('test');

	if (isTest) {
		return babelConfigForJest;
	}

	return babelConfigForWebpackBuild;
};
