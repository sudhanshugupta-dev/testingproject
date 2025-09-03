import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PickerBottomSheet from '../../src/components/PickerBottomSheet';
import { useAppTheme } from '../../src/themes/useTheme';

// Mock the theme hook
jest.mock('../../src/themes/useTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock react-native-modal
jest.mock('react-native-modal', () => 'Modal');

// Mock react-native-image-picker
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
  launchCamera: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    theme: (state = { mode: 'light' }) => state,
  },
});

const mockTheme = {
  colors: {
    card: '#ffffff',
    text: '#000000',
  },
};

describe('PickerBottomSheet Component', () => {
  const mockOnClose = jest.fn();
  const mockOnResult = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders when visible is true', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <PickerBottomSheet
          visible={true}
          onClose={mockOnClose}
          onResult={mockOnResult}
        />
      </Provider>
    );

    expect(getByText('Select Media')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <Provider store={mockStore}>
        <PickerBottomSheet
          visible={false}
          onClose={mockOnClose}
          onResult={mockOnResult}
        />
      </Provider>
    );

    expect(queryByText('Select Media')).toBeNull();
  });

  it('renders all media options', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <PickerBottomSheet
          visible={true}
          onClose={mockOnClose}
          onResult={mockOnResult}
        />
      </Provider>
    );

    expect(getByText('Pick Image / Video')).toBeTruthy();
    expect(getByText('Take Photo')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('calls onClose when cancel button is pressed', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <PickerBottomSheet
          visible={true}
          onClose={mockOnClose}
          onResult={mockOnResult}
        />
      </Provider>
    );

    fireEvent.press(getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('applies correct modal configuration', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <PickerBottomSheet
          visible={true}
          onClose={mockOnClose}
          onResult={mockOnResult}
          testID="picker-modal"
        />
      </Provider>
    );

    const modal = getByTestId('picker-modal');
    expect(modal.props.isVisible).toBe(true);
    expect(modal.props.onBackdropPress).toBe(mockOnClose);
    expect(modal.props.onBackButtonPress).toBe(mockOnClose);
  });
});
