import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomTextInput from '../../component/customeTextInput/CustomTextInput'; // Adjust the import path as necessary

describe('<CustomTextInput />', () => {
  it('renders correctly with the provided placeholder', () => {
    const { getByPlaceholderText } = render(
      <CustomTextInput value="" onChange={() => {}} placeholder="Enter text" />,
    );

    // Check if the placeholder is rendered correctly
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('updates the value when text is entered', () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = render(
      <CustomTextInput
        value=""
        onChange={mockOnChange}
        placeholder="Enter text"
      />,
    );

    // Simulate entering text into the TextInput
    fireEvent.changeText(getByPlaceholderText('Enter text'), 'Hello, World!');

    // Verify if the onChange function is called with the correct value
    expect(mockOnChange).toHaveBeenCalledWith('Hello, World!');
  });

  it('displays the correct value in the input field', () => {
    const { getByPlaceholderText } = render(
      <CustomTextInput
        value="Test"
        onChange={() => {}}
        placeholder="Enter text"
      />,
    );

    // Check if the value in the TextInput is correct
    expect(getByPlaceholderText('Enter text').props.value).toBe('Test');
  });
});
