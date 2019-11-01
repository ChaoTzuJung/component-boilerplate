import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';
// 把 react-router 的 history 跟 store 互相同步, 也就是說 store 裡面會有 router 的狀態
// history + store → react-router-redux → enhanced history(將 react-router 的 history 新增一些東西，再提供給 react-router) → react-router
import { syncHistoryWithStore } from 'react-router-redux';

import Routes from './routes';
import configureStore from './store';

const store = configureStore({});
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
	<Routes store={store} history={history} />,
	document.getElementById('content')
);

