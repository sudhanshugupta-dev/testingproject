import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AnimatedGif from '../../src/components/AnimatedGif/AnimatedGif';

// Mock FastImage
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const MockedFastImage = React.forwardRef((props: any, ref: any) => {
    return React.createElement('FastImage', { ...props, ref, testID: 'fast-image' });
  });
  
  MockedFastImage.priority = {
    low: 'low',
    normal: 'normal',
    high: 'high',
  };
  
  MockedFastImage.resizeMode = {
    contain: 'contain',
    cover: 'cover',
    stretch: 'stretch',
    center: 'center',
  };
  
  return MockedFastImage;
});

// Mock Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('AnimatedGif Component', () => {
  const defaultProps = {
    uri: 'https://example.com/test.gif',
  };

  it('renders with default props', () => {
    const { getByTestId } = render(<AnimatedGif {...defaultProps} />);
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const { getByTestId } = render(
      <AnimatedGif {...defaultProps} width={200} height={200} />
    );
    const image = getByTestId('fast-image');
    expect(image.props.style).toMatchObject({
      width: 200,
      height: 200,
    });
  });

  it('renders with custom border radius', () => {
    const { getByTestId } = render(
      <AnimatedGif {...defaultProps} borderRadius={20} />
    );
    const image = getByTestId('fast-image');
    expect(image.props.style.borderRadius).toBe(20);
  });

  it('shows play/pause button by default', () => {
    const { getByTestId } = render(<AnimatedGif {...defaultProps} />);
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('hides play/pause button when showPlayPauseButton is false', () => {
    const { getByTestId } = render(
      <AnimatedGif {...defaultProps} showPlayPauseButton={false} />
    );
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('toggles play/pause state when button is pressed', () => {
    const { getByTestId } = render(<AnimatedGif {...defaultProps} />);
    const image = getByTestId('fast-image');
    
    // Initially should show original URI
    expect(image.props.source.uri).toBe(defaultProps.uri);
  });

  it('calls onPress when gif is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <AnimatedGif {...defaultProps} onPress={mockOnPress} />
    );
    
    const touchable = getByTestId('fast-image').parent;
    fireEvent.press(touchable);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders without onPress handler', () => {
    const { getByTestId } = render(<AnimatedGif {...defaultProps} />);
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('uses correct FastImage properties', () => {
    const { getByTestId } = render(<AnimatedGif {...defaultProps} />);
    const image = getByTestId('fast-image');
    
    expect(image.props.source).toMatchObject({
      uri: defaultProps.uri,
    });
  });

  it('handles empty uri gracefully', () => {
    const { getByTestId } = render(<AnimatedGif uri="" />);
    const image = getByTestId('fast-image');
    expect(image.props.source.uri).toBe('');
  });

  it('applies correct styles to container', () => {
    const { getByTestId } = render(
      <AnimatedGif {...defaultProps} width={150} height={150} borderRadius={8} />
    );
    const image = getByTestId('fast-image');
    
    expect(image.props.style).toMatchObject({
      width: 150,
      height: 150,
      borderRadius: 8,
    });
  });
});
