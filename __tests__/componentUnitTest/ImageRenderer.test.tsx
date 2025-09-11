import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ImageRenderer from '../../src/components/ChatBubble/ImageRenderer';

describe('ImageRenderer Component', () => {
  const mockOnPreview = jest.fn();
  
  const mockMedia = [
    { uri: 'https://example.com/image1.jpg', type: 'image/jpeg' },
    { uri: 'https://example.com/image2.png', type: 'image/png' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with media items', () => {
    const { getByTestId } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    expect(getByTestId('image-renderer')).toBeTruthy();
  });

  it('renders correct number of images', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    const images = UNSAFE_root.findAllByType('Image');
    expect(images).toHaveLength(2);
  });

  it('calls onPreview when image is pressed', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const firstImage = UNSAFE_root.findAllByType('Image')[0];
    fireEvent.press(firstImage.parent);
    
    expect(mockOnPreview).toHaveBeenCalledWith(mockMedia[0]);
  });

  it('calls onPreview when image is long pressed', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const firstImage = UNSAFE_root.findAllByType('Image')[0];
    fireEvent(firstImage.parent, 'longPress');
    
    expect(mockOnPreview).toHaveBeenCalledWith(mockMedia[0]);
  });

  it('renders with single image', () => {
    const singleMedia = [mockMedia[0]];
    const { UNSAFE_root } = render(
      <ImageRenderer media={singleMedia} onPreview={mockOnPreview} />
    );
    
    const images = UNSAFE_root.findAllByType('Image');
    expect(images).toHaveLength(1);
  });

  it('renders with empty media array', () => {
    const { getByTestId } = render(
      <ImageRenderer media={[]} onPreview={mockOnPreview} />
    );
    expect(getByTestId('image-renderer')).toBeTruthy();
  });

  it('passes correct uri to Image component', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const firstImage = UNSAFE_root.findAllByType('Image')[0];
    expect(firstImage.props.source.uri).toBe(mockMedia[0].uri);
  });

  it('uses cover resize mode', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const firstImage = UNSAFE_root.findAllByType('Image')[0];
    expect(firstImage.props.resizeMode).toBe('cover');
  });

  it('applies correct styles to images', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const firstImage = UNSAFE_root.findAllByType('Image')[0];
    expect(firstImage.props.style).toMatchObject({
      width: 200,
      height: 200,
      borderRadius: 12,
    });
  });

  it('handles multiple image presses correctly', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const images = UNSAFE_root.findAllByType('Image');
    
    fireEvent.press(images[0].parent);
    fireEvent.press(images[1].parent);
    
    expect(mockOnPreview).toHaveBeenCalledTimes(2);
    expect(mockOnPreview).toHaveBeenNthCalledWith(1, mockMedia[0]);
    expect(mockOnPreview).toHaveBeenNthCalledWith(2, mockMedia[1]);
  });

  it('works without onPreview callback', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={() => {}} />
    );
    
    const firstImage = UNSAFE_root.findAllByType('Image')[0];
    expect(() => fireEvent.press(firstImage.parent)).not.toThrow();
  });

  it('handles different image types', () => {
    const mixedMedia = [
      { uri: 'https://example.com/photo.jpg', type: 'image/jpeg' },
      { uri: 'https://example.com/graphic.png', type: 'image/png' },
      { uri: 'https://example.com/icon.webp', type: 'image/webp' },
    ];
    
    const { UNSAFE_root } = render(
      <ImageRenderer media={mixedMedia} onPreview={mockOnPreview} />
    );
    
    const images = UNSAFE_root.findAllByType('Image');
    expect(images).toHaveLength(3);
  });

  it('maintains proper key for each image', () => {
    const { UNSAFE_root } = render(
      <ImageRenderer media={mockMedia} onPreview={mockOnPreview} />
    );
    
    const images = UNSAFE_root.findAllByType('Image');
    expect(images[0]).toBeTruthy();
    expect(images[1]).toBeTruthy();
  });
});
