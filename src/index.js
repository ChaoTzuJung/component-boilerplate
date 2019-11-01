import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory } from 'react-router';

import Routes from './routes';

// TODO:
import '@babel/polyfill';
// import 'core-js/stable';
// import 'regenerator-runtime/runtime';

ReactDOM.render(<Routes history={browserHistory} />, document.getElementById('content'))
