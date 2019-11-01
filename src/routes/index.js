import React from 'react';
import { Router } from 'react-router';
import { hot } from 'react-hot-loader/root';

import Home from 'routes/Home';
import App from 'layouts/App';

const routeConfig = [
	{
		path: '/',
		component: App,
		indexRoute: {
			// react-router實現按需載入(code split): https://codertw.com/%E5%89%8D%E7%AB%AF%E9%96%8B%E7%99%BC/235905/
			getComponent(nextState, cb) => require.ensure(
				// dependencies
				[],
				// callback
				require => {
					const component = require('./Home').default;
					cb(null, component);
				},
				// chunkName
				'Home'
			)
		},
		childRoutes: [],
	}
];

const Routes = ({ history }) => (
	<Router history={history} routes={routeConfig} />
);

export default hot(Routes);
