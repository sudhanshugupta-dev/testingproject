import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../../src/components/CustomButton';
import { Provider } from 'react-redux';
import { store } from '../../src/redux/store';

const renderWithProvider = (ui: React.ReactElement) => render(<Provider store={store}>{ui}</Provider>);

test('CustomButton triggers onPress', () => {
  const onPress = jest.fn();
  const { getByTestId } = renderWithProvider(<CustomButton title="Tap" onPress={onPress} />);
  fireEvent.press(getByTestId('custom-button'));
  expect(onPress).toHaveBeenCalled();
});

test('CustomButton matches snapshot', () => {
  const tree = renderWithProvider(<CustomButton title="Snapshot" />).toJSON();
  expect(tree).toMatchSnapshot();
}); 