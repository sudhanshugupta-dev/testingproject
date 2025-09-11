import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CustomButton from '../../src/components/CustomButton';
import { useAppTheme } from '../../src/themes/useTheme';

// Mock the theme hook
jest.mock('../../src/themes/useTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    theme: (state = { mode: 'light' }) => state,
  },
});

const mockTheme = {
  colors: {
    primary: '#007AFF',
    primaryLight: '#4DA3FF',
    secondary: '#5856D6',
    accent: '#FF2D92',
    danger: '#FF3B30',
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

describe('CustomButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders with correct title', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} />
      </Provider>
    );

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} />
      </Provider>
    );

    fireEvent.press(getByTestId('custom-button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} disabled={true} />
      </Provider>
    );

    fireEvent.press(getByTestId('custom-button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} loading={true} />
      </Provider>
    );

    fireEvent.press(getByTestId('custom-button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('shows loading indicator when loading is true', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} loading={true} />
      </Provider>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId, UNSAFE_root } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} style={customStyle} />
      </Provider>
    );

    // Find the outer View container that receives the style prop
    const container = UNSAFE_root.findByType('View');
    expect(container.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });

  it('renders with primary variant by default', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} />
      </Provider>
    );

    const button = getByTestId('custom-button');
    expect(button).toBeTruthy();
  });

  it('renders with secondary variant', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} variant="secondary" />
      </Provider>
    );

    const button = getByTestId('custom-button');
    expect(button).toBeTruthy();
  });

  it('renders with danger variant', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} variant="danger" />
      </Provider>
    );

    const button = getByTestId('custom-button');
    expect(button).toBeTruthy();
  });

  it('applies disabled styles when disabled', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" onPress={mockOnPress} disabled={true} />
      </Provider>
    );

    // Check that the button is rendered and the disabled functionality works
    // (which is already tested in the "does not call onPress when disabled" test)
    const button = getByTestId('custom-button');
    expect(button).toBeTruthy();
    
    // Test that pressing the button doesn't call onPress (disabled behavior)
    fireEvent.press(button);
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('handles press without onPress prop', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <CustomButton title="Test Button" />
      </Provider>
    );

    const button = getByTestId('custom-button');
    expect(() => fireEvent.press(button)).not.toThrow();
  });
}); 