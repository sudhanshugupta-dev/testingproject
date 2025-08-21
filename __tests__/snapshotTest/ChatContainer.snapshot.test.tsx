import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../../src/redux/store';
import Chat from '../../src/screens/Chat';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

it('Chat screen renders', () => {
  const tree = render(
    <Provider store={store}>
      <NavigationContainer>
        <Chat />
      </NavigationContainer>
    </Provider>
  ).toJSON();
  expect(tree).toMatchSnapshot();
}); 