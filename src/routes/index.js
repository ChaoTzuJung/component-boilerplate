import React from 'react';
import { Router } from 'react-router';

import Home from 'routes/Home';
import App from 'layouts/App';

const routeConfig = [
	{
		path: '/',
		component: App,
		indexRoute: {
			component: Home
		},
		childRoutes: [],
	}
];

const Routes = ({ history }) => (
	<Router history={history} routes={routeConfig} />
);

export default Routes;
