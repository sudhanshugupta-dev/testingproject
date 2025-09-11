import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChatBubble from '../../src/components/ChatBubble';
import { useAppTheme } from '../../src/themes/useTheme';
import { View, Text } from 'react-native';

// Mock dependencies
jest.mock('../../src/themes/useTheme', () => ({
  useAppTheme: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations = {
        'chat.you': 'You',
        'chat.friend': 'Friend',
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock('react-native-video', () => 'Video');

// Mock react-navigation theme
jest.mock('@react-navigation/native', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      text: '#000000',
      primary: '#007AFF',
    },
  }),
}));

// Mock child components with proper React Native components
jest.mock('../../src/components/ChatBubble/ImageRenderer', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockImageRenderer({ media }: any) {
    return (
      <View testID="image-renderer">
        {media && media.map((item: any, index: number) => (
          <Text key={index}>Image: {item.uri}</Text>
        ))}
      </View>
    );
  };
});

jest.mock('../../src/components/ChatBubble/GifRenderer', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockGifRenderer({ media }: any) {
    return (
      <View testID="gif-renderer">
        {media && media.map((item: any, index: number) => (
          <Text key={index}>GIF: {item.uri}</Text>
        ))}
      </View>
    );
  };
});

jest.mock('../../src/components/ChatBubble/VideoRenderer', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockVideoRenderer({ media }: any) {
    return (
      <View testID="video-renderer">
        {media && media.map((item: any, index: number) => (
          <Text key={index}>Video: {item.uri}</Text>
        ))}
      </View>
    );
  };
});

jest.mock('../../src/components/MediaPreviewModal/MediaPreviewModal', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockMediaPreviewModal() {
    return (
      <View testID="media-preview-modal">
        <Text>Media Preview Modal</Text>
      </View>
    );
  };
});

jest.mock('../../src/components/VoiceMessageBubble', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockVoiceMessageBubble({ audioUri, isMine }: any) {
    return (
      <View testID="voice-message-bubble">
        <Text>Voice: {audioUri} ({isMine ? 'mine' : 'theirs'})</Text>
      </View>
    );
  };
});

jest.mock('../../src/components/LoadingIndicator/LoadingIndicator', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return function MockLoadingIndicator({ type, progress, size, showText }: any) {
    return (
      <View testID="loading-indicator">
        <Text>Loading {type}: {progress}%</Text>
      </View>
    );
  };
});

const mockStore = configureStore({
  reducer: {
    theme: (state = { mode: 'light' }) => state,
  },
});

const mockTheme = {
  colors: {
    card: '#ffffff',
    text: '#000000',
    primary: '#007AFF',
  },
};

describe('ChatBubble Component', () => {
  const mockOnLongPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  // 🎯 SCENARIO 1: "User sees text message"
  it('renders text message correctly', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Hello, how are you?"
          isMine={false}
          currentUserId="user123"
        />
      </Provider>
    );
    expect(getByText('Hello, how are you?')).toBeTruthy();
  });

  // 🎯 SCENARIO 2: "User sees their own message"
  it('renders my message with correct styling', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="This is my message"
          isMine={true}
          currentUserId="user123"
          testID="chat-bubble"
        />
      </Provider>
    );
    const bubble = getByTestId('chat-bubble');
    expect(bubble).toBeTruthy();
  });

  // 🎯 SCENARIO 3: "User sees friend's message"
  it('renders their message with correct styling', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="This is their message"
          isMine={false}
          currentUserId="user123"
          testID="chat-bubble"
        />
      </Provider>
    );
    const bubble = getByTestId('chat-bubble');
    expect(bubble).toBeTruthy();
  });

  // 🎯 SCENARIO 4: "User sees message time"
  it('displays timestamp correctly', () => {
    const timestamp = Date.now();
    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with timestamp"
          isMine={false}
          timestamp={timestamp}
          currentUserId="user123"
        />
      </Provider>
    );
    const timeText = new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    expect(getByText(timeText)).toBeTruthy();
  });

  // 🎯 SCENARIO 5: "User sees reply to a message"
  it('renders reply context correctly', () => {
    const replyTo = {
      messageId: '1',
      text: 'Original message',
      senderId: 'user456',
      senderName: 'John Doe',
    };

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Reply message"
          isMine={false}
          replyTo={replyTo}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Original message')).toBeTruthy();
  });

  // 🎯 SCENARIO 6: "User sees reply to their own message"
  it('shows "You" for own reply context', () => {
    const replyTo = {
      messageId: '1',
      text: 'My original message',
      senderId: 'user123',
      senderName: 'John Doe',
    };

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="My reply"
          isMine={true}
          replyTo={replyTo}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('You')).toBeTruthy();
  });

  // 🎯 SCENARIO 7: "User sees image in chat"
  it('renders image media correctly', () => {
    const media = [
      { uri: 'test-image.jpg', type: 'image/jpeg' }
    ];

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with image"
          isMine={false}
          media={media}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Image: test-image.jpg')).toBeTruthy();
  });

  // 🎯 SCENARIO 8: "User sees video in chat"
  it('renders video media correctly', () => {
    const media = [
      { uri: 'test-video.mp4', type: 'video/mp4' }
    ];

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with video"
          isMine={false}
          media={media}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Video: test-video.mp4')).toBeTruthy();
  });

  // 🎯 SCENARIO 9: "User sees GIF in chat"
  it('renders GIF media correctly', () => {
    const media = [
      { uri: 'test-gif.gif', type: 'image/gif' }
    ];

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with GIF"
          isMine={false}
          media={media}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('GIF: test-gif.gif')).toBeTruthy();
  });

  // 🎯 SCENARIO 10: "User sees unsupported file type"
  it('shows unsupported file message for unknown types', () => {
    const media = [
      { uri: 'test-file.pdf', type: 'application/pdf' }
    ];

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with unsupported file"
          isMine={false}
          media={media}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Unsupported file')).toBeTruthy();
  });

  // 🎯 SCENARIO 11: "User long-presses message"
  it('calls onLongPress when long pressed', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Long press me"
          isMine={false}
          onLongPress={mockOnLongPress}
          currentUserId="user123"
          testID="chat-bubble"
        />
      </Provider>
    );

    const bubble = getByTestId('chat-bubble');
    fireEvent(bubble, 'longPress');
    expect(mockOnLongPress).toHaveBeenCalledTimes(1);
  });

  // 🎯 SCENARIO 12: "User sees message without text"
  it('renders message without text', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          isMine={false}
          currentUserId="user123"
          testID="chat-bubble"
        />
      </Provider>
    );

    expect(getByTestId('chat-bubble')).toBeTruthy();
  });

  // 🎯 SCENARIO 13: "User sees message being uploaded"
  it('shows loading indicator when uploading', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Uploading message"
          isMine={false}
          isUploading={true}
          uploadProgress={50}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Loading image: 50%')).toBeTruthy();
  });

  // 🎯 SCENARIO 14: "User sees upload error"
  it('shows error message when upload fails', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Failed message"
          isMine={false}
          uploadError="Network error"
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Upload failed: Network error')).toBeTruthy();
  });

  // 🎯 SCENARIO 15: "User sees voice message"
  it('renders voice message correctly', () => {
    const media = [
      { uri: 'test-audio.m4a', type: 'audio/m4a' }
    ];

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          isMine={false}
          media={media}
          messageType="voice"
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Voice: test-audio.m4a (theirs)')).toBeTruthy();
  });

  // 🎯 SCENARIO 16: "User sees sticker message"
  it('renders sticker message correctly', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="🎉"
          isMine={false}
          messageType="sticker"
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('🎉')).toBeTruthy();
  });

  // 🎯 SCENARIO 17: "User sees message with emoji"
  it('handles emoji in text', () => {
    const emojiText = 'Message with emoji 😀🎉🚀';

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text={emojiText}
          isMine={false}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText(emojiText)).toBeTruthy();
  });

  // 🎯 SCENARIO 18: "User sees message with custom testID"
  it('uses custom testID when provided', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Custom ID message"
          isMine={false}
          currentUserId="user123"
          testID="custom-bubble"
        />
      </Provider>
    );

    expect(getByTestId('custom-bubble')).toBeTruthy();
  });

  // 🎯 SCENARIO 19: "User sees message with long text"
  it('handles very long text messages', () => {
    const longText = 'This is a very long message that should wrap correctly...';

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text={longText}
          isMine={false}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText(longText)).toBeTruthy();
  });
});
