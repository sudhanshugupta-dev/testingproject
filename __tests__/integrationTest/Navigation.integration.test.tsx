import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import rootAuth from '../../src/redux/slices/authSlice';
import themeReducer from '../../src/redux/slices/themeSlice';
import languageReducer from '../../src/redux/slices/languageSlice';
import chatsReducer from '../../src/redux/slices/chatsSlice';
import appBootstrapReducer from '../../src/redux/slices/appBootstrap';

const makeStoreWithAuth = () =>
  configureStore({
    reducer: {
      auth: rootAuth,
      theme: themeReducer,
      language: languageReducer,
      chats: chatsReducer,
      app: appBootstrapReducer,
    },
    preloadedState: {
      auth: { token: 't', user: { uid: 'u1', email: 'user@test.com' }, loading: false },
      theme: { mode: 'light' },
      language: { code: 'en' },
      chats: { list: [], loading: false, error: null },
      app: { bootstrapped: true },
    } as any,
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });

it('renders main tabs without crashing when authenticated', async () => {
  const store = makeStoreWithAuth();
  const { findByTestId } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  // Tab navigator container should exist
  expect(await findByTestId('custom-button')).toBeTruthy();
}); 