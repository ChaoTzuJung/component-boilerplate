// 透過 每個欄位 true 跟 false 去覺得現在這隻檔案的 環境變數是該匯出什麼樣的狀態跟變數
export default {
	// Set production mode or development mode
	NODE_ENV: process.env.NODE_ENV && `"${process.env.NODE_ENV}"`,

	// Set API endpoint
	API: process.env.API && `"${process.env.API}"`,
	PROXY: process.env.PROXY && `"${process.env.PROXY}"`,

	// API設定成什沒環境，env就輸出什麼環境
	DEV: JSON.stringify(process.env.API === 'dev'),
	DEMO: JSON.stringify(process.env.API === 'demo'),
	PRODUCTION: JSON.stringify(process.env.API === 'production'),
};
