import React from 'react';
import { hot } from 'react-hot-loader/root';

const Home = () => (
	<div>
		<div>
			我是Home Component
			This is on {process.env.NODE_ENV} server
		</div>
	</div>
);

export default hot(Home);
