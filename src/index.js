import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import socket from 'socket.io-client';

import './index.css';
import App from './App';
import AuthService from './service/auth';
import TweetService from './service/tweet';
import {
  AuthProvider,
  AuthErrorEventBus,
  fetchToken,
  fetchCsrfToken
} from './context/AuthContext';
import HttpClient from './network/http';

const baseURL = process.env.REACT_APP_BASE_URL;
const authErrorEventBus = new AuthErrorEventBus();
const httpClient = new HttpClient(baseURL, authErrorEventBus, () => fetchCsrfToken());
const authService = new AuthService(httpClient);
const tweetService = new TweetService(httpClient);

// [ Socket IO ]
// const socketIO = socket(baseURL);

// socketIO.on('connect_error', (error) => {
//   console.log('socket error', error);
// });
// socketIO.on('dwitter', (msg) => console.log(msg));


ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider
        authService={authService}
        authErrorEventBus={authErrorEventBus}
      >
        <App tweetService={tweetService} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
