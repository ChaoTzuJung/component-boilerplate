// 如此一來就可以在前端讀取 API_ENDPOINT 來決定後端位置
export const HOST_MAP = {
	dev: 'http://localhost:9000',
	demo: 'http://lab.25sprout.com',
	production: 'http://lab.25sprout.com',
};

const SELF_HOST_MAP = {
	dev: 'http://localhost:3000',
	demo: '',
	production: '',
};

// process.env.API 是什麼值是由，package 內的 script下指令定義 API要帶什麼值
export const API_ENDPOINT = HOST_MAP[process.env.API];
export const SELF_HOST_ENDPOINT = SELF_HOST_MAP[process.env.API];

export default {
	// Set API endpoint(確保value是雙引號輸出，可以用template string 或 JSON.stringify達成)
	API_ENDPOINT: `"${API_ENDPOINT}"`,
	SELF_HOST_ENDPOINT: JSON.stringify(SELF_HOST_ENDPOINT),
};
