import React from 'react';
import { render } from '@testing-library/react-native';
import CustomAvatar from '../../src/components/CustomAvatar';

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

describe('CustomAvatar Component', () => {
  it('renders with default size', () => {
    const { getByTestId } = render(<CustomAvatar name="John Doe" testID="avatar" />);
    expect(getByTestId('avatar')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByTestId } = render(
      <CustomAvatar name="John Doe" size={64} testID="avatar" />
    );
    expect(getByTestId('avatar')).toBeTruthy();
  });

  it('displays initials from full name', () => {
    const { getByText } = render(<CustomAvatar name="John Doe" />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('displays initials from single name', () => {
    const { getByText } = render(<CustomAvatar name="John" />);
    expect(getByText('J')).toBeTruthy();
  });

  it('displays "NA" when no name is provided', () => {
    const { getByText } = render(<CustomAvatar />);
    expect(getByText('NA')).toBeTruthy();
  });

  it('displays "NA" when empty string is provided', () => {
    const { getByText } = render(<CustomAvatar name="" />);
    expect(getByText('NA')).toBeTruthy();
  });

  it('displays "NA" when only whitespace is provided', () => {
    const { getByText } = render(<CustomAvatar name="   " />);
    expect(getByText('NA')).toBeTruthy();
  });

  it('handles names with multiple spaces', () => {
    const { getByText } = render(<CustomAvatar name="John   Doe" />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('generates consistent colors for same name', () => {
    const { getByTestId: getByTestId1 } = render(
      <CustomAvatar name="John Doe" testID="avatar1" />
    );
    const { getByTestId: getByTestId2 } = render(
      <CustomAvatar name="John Doe" testID="avatar2" />
    );

    const avatar1 = getByTestId1('avatar1');
    const avatar2 = getByTestId2('avatar2');
    
    // Both should have the same gradient colors
    expect(avatar1.props.colors).toEqual(avatar2.props.colors);
  });

  it('generates different colors for different names', () => {
    const { getByTestId: getByTestId1 } = render(
      <CustomAvatar name="John Doe" testID="avatar1" />
    );
    const { getByTestId: getByTestId2 } = render(
      <CustomAvatar name="Jane Smith" testID="avatar2" />
    );

    const avatar1 = getByTestId1('avatar1');
    const avatar2 = getByTestId2('avatar2');
    
    // Should have different gradient colors
    expect(avatar1.props.colors).not.toEqual(avatar2.props.colors);
  });

  it('applies correct styles for default size', () => {
    const { getByTestId } = render(<CustomAvatar name="John Doe" testID="avatar" />);
    const avatar = getByTestId('avatar');
    
    expect(avatar.props.style).toContainEqual(
      expect.objectContaining({
        width: 48,
        height: 48,
        borderRadius: 24,
      })
    );
  });

  it('applies correct styles for custom size', () => {
    const size = 64;
    const { getByTestId } = render(
      <CustomAvatar name="John Doe" size={size} testID="avatar" />
    );
    const avatar = getByTestId('avatar');
    
    expect(avatar.props.style).toContainEqual(
      expect.objectContaining({
        width: size,
        height: size,
        borderRadius: size / 2,
      })
    );
  });

  it('scales font size proportionally to avatar size', () => {
    const size = 64;
    const { getByText } = render(<CustomAvatar name="John Doe" size={size} />);
    const text = getByText('JD');
    
    expect(text.props.style).toContainEqual(
      expect.objectContaining({
        fontSize: size * 0.42,
      })
    );
  });

  it('handles special characters in names', () => {
    const { getByText } = render(<CustomAvatar name="José María" />);
    expect(getByText('JM')).toBeTruthy();
  });

  it('handles very long names', () => {
    const { getByText } = render(
      <CustomAvatar name="John Michael Christopher Smith" />
    );
    expect(getByText('JS')).toBeTruthy();
  });
});

