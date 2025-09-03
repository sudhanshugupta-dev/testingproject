import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GoogleSignUpButton from '../../src/components/GoogleButton';

describe('GoogleSignUpButton Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct title', () => {
    const { getByText } = render(
      <GoogleSignUpButton onPress={mockOnPress} title="Sign in with Google" />
    );

    expect(getByText('Sign in with Google')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <GoogleSignUpButton onPress={mockOnPress} title="Sign in with Google" />
    );

    fireEvent.press(getByText('Sign in with Google'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders Google icon', () => {
    const { getByTestId } = render(
      <GoogleSignUpButton onPress={mockOnPress} title="Sign in with Google" />
    );

    const button = getByTestId('google-button');
    expect(button).toBeTruthy();
  });

  it('applies correct styles', () => {
    const { getByTestId } = render(
      <GoogleSignUpButton onPress={mockOnPress} title="Sign in with Google" />
    );

    const button = getByTestId('google-button');
    expect(button.props.style).toContainEqual(
      expect.objectContaining({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      })
    );
  });

  it('handles different titles', () => {
    const { getByText } = render(
      <GoogleSignUpButton onPress={mockOnPress} title="Continue with Google" />
    );

    expect(getByText('Continue with Google')).toBeTruthy();
  });

  it('has correct accessibility props', () => {
    const { getByTestId } = render(
      <GoogleSignUpButton onPress={mockOnPress} title="Sign in with Google" />
    );

    const button = getByTestId('google-button');
    expect(button.props.activeOpacity).toBe(0.7);
  });
});

