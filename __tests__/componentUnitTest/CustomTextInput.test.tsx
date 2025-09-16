import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CustomTextInput from '../../src/components/CustomTextInput';
import { useAppTheme } from '../../src/themes/useTheme';

// Mock the theme hook
jest.mock('../../src/themes/useTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    theme: (state = { mode: 'light' }) => state,
  },
});

const mockTheme = {
  colors: {
    text: '#000000',
    card: '#ffffff',
    border: '#E5E7EB',
    primary: '#007AFF',
    danger: '#FF3B30',
    placeholder: '#9CA3AF',
    textSecondary: '#6B7280',
  },
  fonts: {
    sizes: {
      small: 12,
      medium: 14,
      large: 16,
    },
    weight: {
      normal: '400',
      medium: '500',
      bold: '700',
    },
  },
};

describe('CustomTextInput Component', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          label="Email"
          value=""
          onChangeText={mockOnChangeText}
        />
      </Provider>
    );

    expect(getByText('Email')).toBeTruthy();
  });

  it('renders without label', () => {
    const { queryByText } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
        />
      </Provider>
    );

    expect(queryByText('Email')).toBeNull();
  });

  it('displays placeholder text', () => {
    const { getByPlaceholderText } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
          placeholder="Enter your email"
        />
      </Provider>
    );

    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
  });

  it('calls onChangeText when text is entered', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
          testID="text-input"
        />
      </Provider>
    );

    const input = getByTestId('text-input');
    fireEvent.changeText(input, 'test@example.com');
    expect(mockOnChangeText).toHaveBeenCalledWith('test@example.com');
  });

  it('displays error message when error prop is provided', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
          error="This field is required"
        />
      </Provider>
    );

    expect(getByText('This field is required')).toBeTruthy();
  });

  it('shows password toggle when secureTextEntry is true', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
          secureTextEntry={true}
          testID="text-input"
        />
      </Provider>
    );

    expect(getByTestId('eye-button')).toBeTruthy();
  });

  it('toggles password visibility when eye button is pressed', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
          secureTextEntry={true}
          testID="text-input"
        />
      </Provider>
    );

    const eyeButton = getByTestId('eye-button');
    fireEvent.press(eyeButton);
    
    // The secureTextEntry should be toggled
    const input = getByTestId('text-input');
    expect(input.props.secureTextEntry).toBe(false);
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
          style={customStyle}
          testID="text-input"
        />
      </Provider>
    );

    const container = getByTestId('text-input-container');
    expect(container.props.style).toContainEqual(customStyle);
  });

  it('handles focus and blur events', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
          testID="text-input"
        />
      </Provider>
    );

    const input = getByTestId('text-input');
    fireEvent(input, 'focus');
    fireEvent(input, 'blur');
    
    // Should not throw any errors
    expect(input).toBeTruthy();
  });

  it('displays current value', () => {
    const { getByDisplayValue } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value="current value"
          onChangeText={mockOnChangeText}
        />
      </Provider>
    );

    expect(getByDisplayValue('current value')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomTextInput
          value=""
          onChangeText={mockOnChangeText}
          testID="text-input"
        />
      </Provider>
    );

    const input = getByTestId('text-input');
    expect(input.props.style).toContainEqual(
      expect.objectContaining({
        color: mockTheme.colors.text,
      })
    );
  });
});





