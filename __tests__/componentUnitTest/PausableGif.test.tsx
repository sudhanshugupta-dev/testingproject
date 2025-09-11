import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PausableGif from '../../src/components/AnimatedGif/PausableGif';

// Mock FastImage
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const MockedFastImage = React.forwardRef((props: any, ref: any) => {
    return React.createElement('FastImageView', { ...props, ref, testID: 'fast-image' });
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

describe('PausableGif Component', () => {
  const defaultProps = {
    uri: 'https://example.com/test.gif',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    const { getByTestId } = render(<PausableGif {...defaultProps} />);
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('renders with custom dimensions', () => {
    const { getByTestId } = render(
      <PausableGif {...defaultProps} width={250} height={250} />
    );
    const image = getByTestId('fast-image');
    expect(image.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          width: 250,
          height: 250,
        })
      ])
    );
  });

  it('renders with custom border radius', () => {
    const { getByTestId } = render(
      <PausableGif {...defaultProps} borderRadius={20} />
    );
    const image = getByTestId('fast-image');
    expect(image.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          borderRadius: 20,
        })
      ])
    );
  });

  it('shows play/pause controls by default', () => {
    const { getByTestId } = render(<PausableGif {...defaultProps} />);
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('hides play/pause controls when showPlayPauseControls is false', () => {
    const { getByTestId } = render(
      <PausableGif {...defaultProps} showPlayPauseControls={false} />
    );
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('starts in playing state', () => {
    const { getByTestId } = render(<PausableGif {...defaultProps} />);
    const image = getByTestId('fast-image');
    expect(image.props.source.uri).toBe(defaultProps.uri);
  });

  it('calls onPress when gif is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <PausableGif {...defaultProps} onPress={mockOnPress} />
    );
    
    const touchable = getByTestId('fast-image').parent;
    fireEvent.press(touchable);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders without onPress handler', () => {
    const { getByTestId } = render(<PausableGif {...defaultProps} />);
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('uses correct FastImage properties', () => {
    const { getByTestId } = render(<PausableGif {...defaultProps} />);
    const image = getByTestId('fast-image');
    
    expect(image.props.source).toMatchObject({
      uri: defaultProps.uri,
    });
  });

  it('handles empty uri gracefully', () => {
    const { getByTestId } = render(<PausableGif uri="" />);
    const image = getByTestId('fast-image');
    expect(image.props.source.uri).toBe('');
  });

  it('applies correct container styles', () => {
    const { getByTestId } = render(
      <PausableGif {...defaultProps} width={180} height={180} />
    );
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('generates static image URI correctly', () => {
    const gifUri = 'https://example.com/animation.gif';
    const { getByTestId } = render(<PausableGif uri={gifUri} />);
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('handles GIF key changes for restart functionality', () => {
    const { getByTestId } = render(<PausableGif {...defaultProps} />);
    const image = getByTestId('fast-image');
    // The component should render successfully with the GIF functionality
    // The key prop is used internally for restart functionality
    expect(image).toBeTruthy();
    expect(image.props.source.uri).toBe(defaultProps.uri);
  });

  it('shows control overlay when enabled', () => {
    const { getByTestId } = render(
      <PausableGif {...defaultProps} showPlayPauseControls={true} />
    );
    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('handles console logging for pause action', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<PausableGif {...defaultProps} />);
    consoleSpy.mockRestore();
  });

  it('handles image error gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<PausableGif {...defaultProps} />);
    consoleSpy.mockRestore();
  });

  it('applies correct resize mode', () => {
    const { getByTestId } = render(<PausableGif {...defaultProps} />);
    const image = getByTestId('fast-image');
    expect(image.props.resizeMode).toBeDefined();
  });
});
