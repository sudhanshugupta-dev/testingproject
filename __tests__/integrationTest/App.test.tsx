import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import App from '../../App'; 
import { handleButtonPress, dummyApiCall } from '../../servies/apiFunction'; 
import { Alert } from 'react-native';

jest.mock('../../servies/apiFunction', () => ({
  handleButtonPress: jest.fn(),
  dummyApiCall: jest.fn(),
}));

jest.spyOn(Alert, 'alert').mockImplementation(() => {});

beforeEach(() => {
  global.fetch = jest.fn();
});

describe('App Component Integration Test', () => {
  it('should update input value and call handleButtonPress when button is pressed', async () => {
    const { getByPlaceholderText, getByText } = render(<App />);

    const inputField = getByPlaceholderText('Enter something...');
    const button = getByText('Press me');

    fireEvent.changeText(inputField, 'Test input');

    expect(inputField.props.value).toBe('Test input');
    fireEvent.press(button);
    expect(handleButtonPress).toHaveBeenCalledWith('Test input');
  });

  it('should show an alert on button press when API call is successful', async () => {
    global.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: true }),
      ok: true,
      status: 200,
    });

    const { getByPlaceholderText, getByText } = render(<App />);

   
    const inputField = getByPlaceholderText('Enter something...');
    const button = getByText('Press me');

    fireEvent.changeText(inputField, 'Test input');
    fireEvent.press(button);
  });

  it('should handle errors and show error alert when API call fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    
    const { getByPlaceholderText, getByText } = render(<App />);

    const inputField = getByPlaceholderText('Enter something...');
    const button = getByText('Press me');

    fireEvent.changeText(inputField, 'Test input');
    fireEvent.press(button);
  });

  it('should show validation error for empty input', () => {
    const { getByText, getByPlaceholderText } = render(<App />);

    const inputField = getByPlaceholderText('Enter something...');
    const button = getByText('Press me');

    fireEvent.changeText(inputField, '');
    fireEvent.press(button);

    expect(handleButtonPress).toHaveBeenCalledWith('');
  });
});
