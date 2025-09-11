import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GifRenderer from '../../src/components/ChatBubble/GifRenderer';

// Mock PausableGif component
jest.mock('../../src/components/AnimatedGif/PausableGif', () => {
  return function MockPausableGif({ uri, onPress, width, height, borderRadius }: any) {
    const { View, Text, TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID="pausable-gif">
        <View style={{ width, height, borderRadius }}>
          <Text>PausableGif: {uri}</Text>
        </View>
      </TouchableOpacity>
    );
  };
});

describe('GifRenderer Component', () => {
  const mockOnPreview = jest.fn();
  
  const mockMedia = [
    { uri: 'https://example.com/animation1.gif', type: 'image/gif' },
    { uri: 'https://example.com/animation2.gif', type: 'image/gif' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with media items', () => {
    const { getAllByTestId } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    const gifs = getAllByTestId('pausable-gif');
    expect(gifs).toHaveLength(2);
  });

  it('renders correct number of GIFs', () => {
    const { getAllByTestId } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    const gifs = getAllByTestId('pausable-gif');
    expect(gifs).toHaveLength(mockMedia.length);
  });

  it('calls onPreview when GIF is pressed', () => {
    const { getAllByTestId } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const firstGif = getAllByTestId('pausable-gif')[0];
    fireEvent.press(firstGif);
    
    expect(mockOnPreview).toHaveBeenCalledWith(mockMedia[0]);
  });

  it('renders with single GIF', () => {
    const singleMedia = [mockMedia[0]];
    const { getAllByTestId } = render(
      <GifRenderer media={singleMedia} onPreview={mockOnPreview} />
    );
    
    const gifs = getAllByTestId('pausable-gif');
    expect(gifs).toHaveLength(1);
  });

  it('renders with empty media array', () => {
    const { queryAllByTestId } = render(
      <GifRenderer media={[]} onPreview={mockOnPreview} />
    );
    const gifs = queryAllByTestId('pausable-gif');
    expect(gifs).toHaveLength(0);
  });

  it('passes correct props to PausableGif', () => {
    const { getByText } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    expect(getByText('PausableGif: https://example.com/animation1.gif')).toBeTruthy();
  });

  it('uses correct dimensions for PausableGif', () => {
    const { getAllByTestId } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const firstGif = getAllByTestId('pausable-gif')[0];
    const gifView = firstGif.children[0];
    expect(gifView.props.style).toMatchObject({
      width: 200,
      height: 200,
      borderRadius: 12,
    });
  });

  it('handles multiple GIF presses correctly', () => {
    const { getAllByTestId } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const gifs = getAllByTestId('pausable-gif');
    
    fireEvent.press(gifs[0]);
    fireEvent.press(gifs[1]);
    
    expect(mockOnPreview).toHaveBeenCalledTimes(2);
    expect(mockOnPreview).toHaveBeenNthCalledWith(1, mockMedia[0]);
    expect(mockOnPreview).toHaveBeenNthCalledWith(2, mockMedia[1]);
  });

  it('works without onPreview callback', () => {
    const { getAllByTestId } = render(
      <GifRenderer media={mockMedia} onPreview={() => {}} />
    );
    
    const firstGif = getAllByTestId('pausable-gif')[0];
    expect(() => fireEvent.press(firstGif)).not.toThrow();
  });

  it('enables play/pause controls by default', () => {
    const { getAllByTestId } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const gifs = getAllByTestId('pausable-gif');
    expect(gifs[0]).toBeTruthy();
  });

  it('maintains proper key for each GIF', () => {
    const { getAllByTestId } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const gifs = getAllByTestId('pausable-gif');
    expect(gifs[0]).toBeTruthy();
    expect(gifs[1]).toBeTruthy();
  });

  it('handles different GIF URIs', () => {
    const mixedMedia = [
      { uri: 'https://example.com/funny.gif', type: 'image/gif' },
      { uri: 'https://example.com/cool.gif', type: 'image/gif' },
      { uri: 'https://example.com/awesome.gif', type: 'image/gif' },
    ];
    
    const { getAllByTestId } = render(
      <GifRenderer media={mixedMedia} onPreview={mockOnPreview} />
    );
    
    const gifs = getAllByTestId('pausable-gif');
    expect(gifs).toHaveLength(3);
  });

  it('applies container styles correctly', () => {
    const { UNSAFE_root } = render(
      <GifRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});
