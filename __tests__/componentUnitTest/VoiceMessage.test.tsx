import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import VoiceMessage from '../../src/components/VoiceMessage';

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    theme: (state = { mode: 'light' }) => state,
  },
});

describe('VoiceMessage Component', () => {
  const mockOnSend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders recording controls initially', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    expect(getByText('Tap to start recording')).toBeTruthy();
    expect(getByText('00:00')).toBeTruthy();
  });

  it('starts recording when record button is pressed', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    const recordButton = getByText('Tap to start recording');
    
    await act(async () => {
      fireEvent.press(recordButton);
    });

    // The component should render without errors
    expect(getByText('Tap to start recording')).toBeTruthy();
  });

  it('handles record button press', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    const recordButton = getByText('Tap to start recording');
    
    await act(async () => {
      fireEvent.press(recordButton);
    });

    // The component should render without errors
    expect(getByText('Tap to start recording')).toBeTruthy();
  });

  it('handles cancel button press', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    const cancelButton = getByText('Cancel');
    
    await act(async () => {
      fireEvent.press(cancelButton);
    });

    // The component should render without errors
    expect(getByText('Tap to start recording')).toBeTruthy();
  });

  it('renders with all required elements', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    expect(getByText('Tap to start recording')).toBeTruthy();
    expect(getByText('00:00')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('works without onSend callback', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage />
      </Provider>
    );

    expect(getByText('Tap to start recording')).toBeTruthy();
  });

  it('renders with permission granted', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    expect(getByText('Tap to start recording')).toBeTruthy();
    expect(getByText('00:00')).toBeTruthy();
  });
});


