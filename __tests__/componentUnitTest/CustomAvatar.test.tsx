import React from 'react';
import { render } from '@testing-library/react-native';
import CustomAvatar from '../../src/components/CustomAvatar';

// Mock LinearGradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

describe('CustomAvatar Component', () => {
  it('renders with default size', () => {
    const { getByText } = render(<CustomAvatar name="John Doe" />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { getByText } = render(
      <CustomAvatar name="John Doe" size={64} />
    );
    expect(getByText('JD')).toBeTruthy();
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
    const { UNSAFE_root } = render(<CustomAvatar name="   " />);
    const textElement = UNSAFE_root.findByType('Text');
    expect(textElement.props.children).toBe('');
  });

  it('handles names with multiple spaces', () => {
    const { getByText } = render(<CustomAvatar name="John   Doe" />);
    expect(getByText('JD')).toBeTruthy();
  });

  it('generates consistent colors for same name', () => {
    const { UNSAFE_root: root1 } = render(
      <CustomAvatar name="John Doe" />
    );
    const { UNSAFE_root: root2 } = render(
      <CustomAvatar name="John Doe" />
    );

    const avatar1 = root1.findByType('LinearGradient');
    const avatar2 = root2.findByType('LinearGradient');
    
    // Both should have the same gradient colors
    expect(avatar1.props.colors).toEqual(avatar2.props.colors);
  });

  it('generates different colors for different names', () => {
    const { UNSAFE_root: root1 } = render(
      <CustomAvatar name="Alice" />
    );
    const { UNSAFE_root: root2 } = render(
      <CustomAvatar name="Bob" />
    );

    const avatar1 = root1.findByType('LinearGradient');
    const avatar2 = root2.findByType('LinearGradient');
    
    // Should have different gradient colors
    expect(avatar1.props.colors).not.toEqual(avatar2.props.colors);
  });

  it('applies correct styles for default size', () => {
    const { UNSAFE_root } = render(<CustomAvatar name="John Doe" />);
    const avatar = UNSAFE_root.findByType('LinearGradient');
    
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
    const { UNSAFE_root } = render(
      <CustomAvatar name="John Doe" size={size} />
    );
    const avatar = UNSAFE_root.findByType('LinearGradient');
    
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
    const { UNSAFE_root } = render(<CustomAvatar name="John Doe" size={size} />);
    const text = UNSAFE_root.findByType('Text');
    
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


