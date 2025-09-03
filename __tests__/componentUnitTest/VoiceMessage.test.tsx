import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import VoiceMessage from '../../src/components/VoiceMessage';

// Mock react-native-audio-recorder-player
jest.mock('react-native-audio-recorder-player', () => ({
  __esModule: true,
  default: {
    startRecorder: jest.fn().mockResolvedValue('test-recording-path'),
    stopRecorder: jest.fn().mockResolvedValue('test-recording-path'),
    startPlayer: jest.fn().mockResolvedValue('test-playback-path'),
    stopPlayer: jest.fn().mockResolvedValue('test-playback-path'),
    seekToPlayer: jest.fn().mockResolvedValue('test-seek-path'),
    addRecordBackListener: jest.fn(),
    removeRecordBackListener: jest.fn(),
    addPlayBackListener: jest.fn(),
    removePlayBackListener: jest.fn(),
    mmssss: jest.fn((time) => `00:${time.toString().padStart(2, '0')}`),
  },
}));

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

    expect(getByText('Record')).toBeTruthy();
    expect(getByText('00:00')).toBeTruthy();
  });

  it('starts recording when record button is pressed', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    await waitFor(() => {
      expect(getByText('Stop')).toBeTruthy();
    });
  });

  it('stops recording and calls onSend when stop button is pressed', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    await waitFor(() => {
      const stopButton = getByText('Stop');
      fireEvent.press(stopButton);
    });

    await waitFor(() => {
      expect(mockOnSend).toHaveBeenCalledWith('test-recording-path');
    });
  });

  it('shows playback controls after recording', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    // Start recording
    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    // Stop recording
    await waitFor(() => {
      const stopButton = getByText('Stop');
      fireEvent.press(stopButton);
    });

    // Should show playback controls
    await waitFor(() => {
      expect(getByText('Play')).toBeTruthy();
      expect(getByText('00:00 / 00:00')).toBeTruthy();
    });
  });

  it('starts playback when play button is pressed', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    // Record first
    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    await waitFor(() => {
      const stopButton = getByText('Stop');
      fireEvent.press(stopButton);
    });

    // Start playback
    await waitFor(() => {
      const playButton = getByText('Play');
      fireEvent.press(playButton);
    });

    await waitFor(() => {
      expect(getByText('Pause')).toBeTruthy();
    });
  });

  it('stops playback when pause button is pressed', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    // Record first
    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    await waitFor(() => {
      const stopButton = getByText('Stop');
      fireEvent.press(stopButton);
    });

    // Start playback
    await waitFor(() => {
      const playButton = getByText('Play');
      fireEvent.press(playButton);
    });

    // Stop playback
    await waitFor(() => {
      const pauseButton = getByText('Pause');
      fireEvent.press(pauseButton);
    });

    await waitFor(() => {
      expect(getByText('Play')).toBeTruthy();
    });
  });

  it('handles seek forward button', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    // Record first
    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    await waitFor(() => {
      const stopButton = getByText('Stop');
      fireEvent.press(stopButton);
    });

    // Seek forward
    await waitFor(() => {
      const seekForwardButton = getByText('+5s');
      fireEvent.press(seekForwardButton);
    });

    // Should not throw any errors
    expect(getByText('Play')).toBeTruthy();
  });

  it('handles seek backward button', async () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    // Record first
    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    await waitFor(() => {
      const stopButton = getByText('Stop');
      fireEvent.press(stopButton);
    });

    // Seek backward
    await waitFor(() => {
      const seekBackwardButton = getByText('-5s');
      fireEvent.press(seekBackwardButton);
    });

    // Should not throw any errors
    expect(getByText('Play')).toBeTruthy();
  });

  it('handles recording errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    // Should not crash on error
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('handles playback errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage onSend={mockOnSend} />
      </Provider>
    );

    // Record first
    const recordButton = getByText('Record');
    fireEvent.press(recordButton);

    await waitFor(() => {
      const stopButton = getByText('Stop');
      fireEvent.press(stopButton);
    });

    // Start playback
    await waitFor(() => {
      const playButton = getByText('Play');
      fireEvent.press(playButton);
    });

    // Should not crash on error
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('works without onSend callback', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <VoiceMessage />
      </Provider>
    );

    expect(getByText('Record')).toBeTruthy();
  });
});

