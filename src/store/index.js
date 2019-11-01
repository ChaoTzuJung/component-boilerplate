import { createStore, applyMiddleware, compose } from 'redux';

// 自動幫你發的action加上 _PENDING , _REJECTED , _FULFILLED 讓你自己不用真的根據promise成功或失敗做3種Type
import promiseMiddleware from 'redux-promise-middleware';
// 原生概念的action creator是回傳一個action(object)，「thunk化」的action creator，則回傳一個function(dispatch, getState)
import thunkMiddleware from 'redux-thunk-fsa';
// Apply the middleware to the store，有install這個，才能使用 push(location), replace(location), go(number), goBack(), goForward()
import { routerMiddleware } from 'react-router-redux';
import { browserHistory } from 'react-router';

import reducers from 'models/reducers';

const reduxRouterMiddleware = routerMiddleware(browserHistory);

const middlewares = [reduxRouterMiddleware, thunkMiddleware, promiseMiddleware];
// 從右到左來組合多個函數
let composeEnhancers = compose;

if (process.env.NODE_ENV !== 'production') {
	const { createLogger } = require('redux-logger'); // eslint-disable-line global-require
	middlewares.push(createLogger());
	composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

const configureStore = prevState => {
	const store = createStore(reducers, prevState, composeEnhancers(applyMiddleware(...middlewares)));

	// Module API 來自 Hot Module Replacement 的 Plugin
	if (module.hot) {
		// accept(dependencies, callback)
		module.hot.accept('../models/reducers', () => {
			// Do something with the updated library module..
			const nextReducers = require('../models/reducers').default; // eslint-disable-line global-require
			// replaces the current active root reducer function with a new root reducer function
			store.replaceReducer(nextReducers);
		});
	}

	return store;
}

export default configureStore;
