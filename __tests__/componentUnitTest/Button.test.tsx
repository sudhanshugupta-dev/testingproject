import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../../src/components/CustomButton'; // Adjust the path to your component
import { Provider } from 'react-redux';
import { store } from '../../src/redux/store';

const renderWithProvider = (ui: React.ReactElement) => render(<Provider store={store}>{ui}</Provider>);

describe('CustomButton', () => {
  it('renders the button with the correct title', () => {
    const { getByTestId, getByText } = renderWithProvider(
      <CustomButton title="Click Me" testID="custom-button" />,
    );
    expect(getByTestId('custom-button')).toBeTruthy();
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress function when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = renderWithProvider(
      <CustomButton
        title="Click Me"
        onPress={onPressMock}
        testID="custom-button"
      />,
    );
    fireEvent.press(getByTestId('custom-button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = renderWithProvider(
      <CustomButton
        title="Click Me"
        onPress={onPressMock}
        disabled
        testID="custom-button"
      />,
    );
    fireEvent.press(getByTestId('custom-button'));
    expect(onPressMock).not.toHaveBeenCalled();
  });
});
