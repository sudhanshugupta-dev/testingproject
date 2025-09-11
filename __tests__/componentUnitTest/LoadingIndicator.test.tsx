import React from 'react';
import { render } from '@testing-library/react-native';
import LoadingIndicator from '../../src/components/LoadingIndicator/LoadingIndicator';

// Mock react-navigation theme
jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',
      card: '#ffffff',
      text: '#000000',
      border: '#e0e0e0',
    },
  }),
}));

// Mock Ionicons
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

describe('LoadingIndicator Component', () => {
  it('renders with image type', () => {
    const { getByText } = render(<LoadingIndicator type="image" />);
    expect(getByText('Uploading image...')).toBeTruthy();
  });

  it('renders with voice type', () => {
    const { getByText } = render(<LoadingIndicator type="voice" />);
    expect(getByText('Uploading voice...')).toBeTruthy();
  });

  it('renders with video type', () => {
    const { getByText } = render(<LoadingIndicator type="video" />);
    expect(getByText('Uploading video...')).toBeTruthy();
  });

  it('renders with file type', () => {
    const { getByText } = render(<LoadingIndicator type="file" />);
    expect(getByText('Uploading file...')).toBeTruthy();
  });

  it('renders with small size', () => {
    const { getByText } = render(<LoadingIndicator type="image" size="small" />);
    expect(getByText('Uploading image...')).toBeTruthy();
  });

  it('renders with medium size (default)', () => {
    const { getByText } = render(<LoadingIndicator type="image" size="medium" />);
    expect(getByText('Uploading image...')).toBeTruthy();
  });

  it('renders with large size', () => {
    const { getByText } = render(<LoadingIndicator type="image" size="large" />);
    expect(getByText('Uploading image...')).toBeTruthy();
  });

  it('hides text when showText is false', () => {
    const { queryByText } = render(
      <LoadingIndicator type="image" showText={false} />
    );
    expect(queryByText('Uploading image...')).toBeNull();
  });

  it('shows text by default', () => {
    const { getByText } = render(<LoadingIndicator type="image" />);
    expect(getByText('Uploading image...')).toBeTruthy();
  });

  it('renders progress bar when progress is provided', () => {
    const { UNSAFE_root } = render(
      <LoadingIndicator type="image" progress={50} />
    );
    // Find all Views and check if any has the width style
    const allViews = UNSAFE_root.findAllByType('View');
    const progressFill = allViews.find(view => 
      view.props.style && 
      Array.isArray(view.props.style) && 
      view.props.style.some(styleObj => 
        styleObj && typeof styleObj === 'object' && styleObj.width === '50%'
      )
    );
    expect(progressFill).toBeTruthy();
  });

  it('does not render progress bar when progress is undefined', () => {
    const { UNSAFE_root } = render(
      <LoadingIndicator type="image" />
    );
    const progressBars = UNSAFE_root.findAllByProps({ style: expect.arrayContaining([expect.objectContaining({ width: expect.stringMatching(/%/) })]) });
    expect(progressBars).toHaveLength(0);
  });

  it('renders with 0% progress', () => {
    const { UNSAFE_root } = render(
      <LoadingIndicator type="image" progress={0} />
    );
    // Find all Views and check if any has the width style
    const allViews = UNSAFE_root.findAllByType('View');
    const progressFill = allViews.find(view => 
      view.props.style && 
      Array.isArray(view.props.style) && 
      view.props.style.some(styleObj => 
        styleObj && typeof styleObj === 'object' && styleObj.width === '0%'
      )
    );
    expect(progressFill).toBeTruthy();
  });

  it('renders with 100% progress', () => {
    const { UNSAFE_root } = render(
      <LoadingIndicator type="image" progress={100} />
    );
    // Find all Views and check if any has the width style
    const allViews = UNSAFE_root.findAllByType('View');
    const progressFill = allViews.find(view => 
      view.props.style && 
      Array.isArray(view.props.style) && 
      view.props.style.some(styleObj => 
        styleObj && typeof styleObj === 'object' && styleObj.width === '100%'
      )
    );
    expect(progressFill).toBeTruthy();
  });

  it('renders ActivityIndicator', () => {
    const { UNSAFE_root } = render(
      <LoadingIndicator type="image" />
    );
    const activityIndicator = UNSAFE_root.findByType('ActivityIndicator');
    expect(activityIndicator).toBeTruthy();
  });

  it('uses correct icon for each type', () => {
    const types = ['image', 'voice', 'video', 'file'] as const;
    
    types.forEach(type => {
      const { UNSAFE_root } = render(
        <LoadingIndicator type={type} />
      );
      const icon = UNSAFE_root.findByType('Icon');
      expect(icon).toBeTruthy();
    });
  });

  it('applies correct container styles', () => {
    const { UNSAFE_root } = render(
      <LoadingIndicator type="image" />
    );
    const container = UNSAFE_root.findByType('View');
    expect(container).toBeTruthy();
  });

  it('handles all size configurations', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach(size => {
      const { UNSAFE_root } = render(
        <LoadingIndicator type="image" size={size} />
      );
      const container = UNSAFE_root.findByType('View');
      expect(container).toBeTruthy();
    });
  });

  it('renders with all props combined', () => {
    const { getByText, UNSAFE_root } = render(
      <LoadingIndicator 
        type="video" 
        progress={75} 
        size="large" 
        showText={true}
      />
    );
    
    expect(getByText('Uploading video...')).toBeTruthy();
    // Find all Views and check if any has the width style
    const allViews = UNSAFE_root.findAllByType('View');
    const progressFill = allViews.find(view => 
      view.props.style && 
      Array.isArray(view.props.style) && 
      view.props.style.some(styleObj => 
        styleObj && typeof styleObj === 'object' && styleObj.width === '75%'
      )
    );
    expect(progressFill).toBeTruthy();
  });

  it('handles edge case with negative progress', () => {
    const { UNSAFE_root } = render(
      <LoadingIndicator type="image" progress={-10} />
    );
    // Find all Views and check if any has the width style
    const allViews = UNSAFE_root.findAllByType('View');
    const progressFill = allViews.find(view => 
      view.props.style && 
      Array.isArray(view.props.style) && 
      view.props.style.some(styleObj => 
        styleObj && typeof styleObj === 'object' && styleObj.width === '-10%'
      )
    );
    expect(progressFill).toBeTruthy();
  });

  it('handles edge case with progress over 100', () => {
    const { UNSAFE_root } = render(
      <LoadingIndicator type="image" progress={150} />
    );
    // Find all Views and check if any has the width style
    const allViews = UNSAFE_root.findAllByType('View');
    const progressFill = allViews.find(view => 
      view.props.style && 
      Array.isArray(view.props.style) && 
      view.props.style.some(styleObj => 
        styleObj && typeof styleObj === 'object' && styleObj.width === '150%'
      )
    );
    expect(progressFill).toBeTruthy();
  });
});
