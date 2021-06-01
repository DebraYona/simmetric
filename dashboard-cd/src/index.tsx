import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import Amplify from 'aws-amplify';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { ThemeProvider } from '@material-ui/core';
// import Amplify, { API } from 'aws-amplify';
import configureStore from './app/store';
import config from './config';
import App from './app/App';
import * as serviceWorker from './serviceWorker';
import { AuthProvider } from './app/context/auth-context';

const store = configureStore();

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  },
  // Storage: {
  //   region: config.s3.REGION,
  //   bucket: config.s3.BUCKET,
  //   identityPoolId: config.cognito.IDENTITY_POOL_ID
  // },
  API: {
    endpoints: [
      {
        name: 'tv',
        endpoint: config.apiGateway.URL,
        region: config.apiGateway.REGION
      }
    ]
  }
});

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#FF6900'
    }
  }
});

// Fix to prevent API Not Configured error when build
// API.configure({
//   endpoints: [
//     {
//       name: 'noti',
//       endpoint: config.apiGateway.URL,
//       region: config.apiGateway.REGION
//     }
//   ]
// });

ReactDOM.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <App />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
