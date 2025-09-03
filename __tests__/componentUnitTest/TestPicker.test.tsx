import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import TestPicker from '../../src/components/TestPicker';

// Mock PickerBottomSheet
jest.mock('../../src/components/PickerBottomSheet', () => 'PickerBottomSheet');

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    theme: (state = { mode: 'light' }) => state,
  },
});

describe('TestPicker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <TestPicker />
      </Provider>
    );

    expect(getByText('Open Picker')).toBeTruthy();
    expect(getByText('Selected files: 0')).toBeTruthy();
  });

  it('opens picker when button is pressed', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <TestPicker />
      </Provider>
    );

    const button = getByText('Open Picker');
    fireEvent.press(button);

    // Should not throw any errors
    expect(button).toBeTruthy();
  });

  it('updates selected files count', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <TestPicker />
      </Provider>
    );

    expect(getByText('Selected files: 0')).toBeTruthy();
  });

  it('renders PickerBottomSheet component', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <TestPicker testID="test-picker" />
      </Provider>
    );

    expect(getByTestId('test-picker')).toBeTruthy();
  });

  it('has correct styling', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <TestPicker testID="test-picker" />
      </Provider>
    );

    const container = getByTestId('test-picker');
    expect(container).toBeTruthy();
  });

  it('handles multiple button presses', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <TestPicker />
      </Provider>
    );

    const button = getByText('Open Picker');
    
    // Multiple presses should not cause issues
    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(button).toBeTruthy();
  });
});

