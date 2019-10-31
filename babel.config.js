// babel 7 簡單升級指南: https://www.itread01.com/content/1543305972.html
// 此檔案跟 webpack內的babel做不同的事，這只給node執行，cammand line要帶參數

const babelConfigForWebpackBuild = {
	presets: [
		[
			// polyfill已經被整合在裡面，不用自己在整合
			'@babel/preset-env',
			{
				loose: true,
				useBuiltIns: 'usage',
				corejs: 2,
			},
		],
		'@babel/preset-react',
	],
	// Stage 3
	plugins: [
		['module-resolver', { root: ['./src'] }],
		'@babel/plugin-syntax-dynamic-import', // 動態import加載
		'@babel/plugin-syntax-import-meta', // Allow parsing of import.meta
		'@babel/plugin-proposal-class-properties', // 解析Class的屬性
		'@babel/plugin-proposal-json-strings',
		'@babel/plugin-transform-react-constant-elements',
	],
};

const babelConfigForJest = {
	presets: [
		[
			'@babel/preset-env',
			{
				loose: true,
				useBuiltIns: 'usage',
				corejs: 2,
				// webpack offers multiple deployment targets(server(node) or browser(web))
				targets: {
					node: 'current',
				},
			},
		],
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
};

module.exports = api => {
	const isTest = api.env('test');

	if (isTest) {
		return babelConfigForJest;
	}

	return babelConfigForWebpackBuild;
};
