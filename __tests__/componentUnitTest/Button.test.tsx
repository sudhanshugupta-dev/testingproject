// import { render, fireEvent } from '@testing-library/react-native';
// import { CustomButton } from '../../component/custombutton/CustomButton';

// describe('<CustomButton />', () => {
//   it('renders correctly', () => {
//     const { getByText } = render(
//       <CustomButton onPress={() => {}}>Click Me</CustomButton>,
//     );
//     const buttonText = getByText('Click Me');
//     expect(buttonText).toBeTruthy();
//   });

//   it('calls onPress when pressed', () => {
//     const onPressMock = jest.fn();
//     const { getByText } = render(
//       <CustomButton onPress={onPressMock}>Click Me</CustomButton>,
//     );
//     const buttonText = getByText('Click Me');

//     // Fire the press event
//     fireEvent.press(buttonText);

//     // Verify if onPress function was called and log to the console
//     expect(onPressMock).toHaveBeenCalledTimes(1);
//     console.log('Button was pressed');
//   });

//   it('renders with different text', () => {
//     const { getByText } = render(
//       <CustomButton onPress={() => {}}>Submit</CustomButton>,
//     );
//     expect(getByText('Submit')).toBeTruthy();
//   });
// });

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../../src/components/CustomButton'; // Adjust the path to your component

describe('CustomButton', () => {
  it('renders the button with the correct title', () => {
    const { getByTestId, getByText } = render(
      <CustomButton title="Click Me" testID="custom-button" />,
    );
    expect(getByTestId('custom-button')).toBeTruthy();
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress function when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
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
    const { getByTestId } = render(
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

  it('applies custom style prop correctly', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <CustomButton
        title="Click Me"
        style={customStyle}
        testID="custom-button"
      />,
    );
    const button = getByTestId('custom-button');
    expect(button).toHaveStyle({ opacity: 1 });
    expect(button).toHaveStyle(customStyle);
  });

  it('changes opacity when pressed', () => {
    const { getByTestId } = render(
      <CustomButton title="Click Me" testID="custom-button" />,
    );
    const button = getByTestId('custom-button');
    fireEvent(button, 'pressIn');
    expect(button).toHaveStyle({ opacity: 0.9 });
    fireEvent(button, 'pressOut');
    expect(button).toHaveStyle({ opacity: 1 });
  });

  it('renders Text with correct styles', () => {
    const { getByText } = render(
      <CustomButton title="Click Me" testID="custom-button" />,
    );
    const text = getByText('Click Me');
    expect(text).toHaveStyle({
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    });
  });
});
