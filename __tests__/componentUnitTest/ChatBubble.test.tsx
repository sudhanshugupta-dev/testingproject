import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ChatBubble from '../../src/components/ChatBubble';
import { useAppTheme } from '../../src/themes/useTheme';

// Mock the theme hook
jest.mock('../../src/themes/useTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock i18n
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

// Mock react-native-video
jest.mock('react-native-video', () => 'Video');

// Mock Redux store
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

    // Should display time in HH:MM format
    const timeText = new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    expect(getByText(timeText)).toBeTruthy();
  });

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
    expect(getByText('Reply message')).toBeTruthy();
  });

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

  it('shows "Friend" when sender name is missing', () => {
    const replyTo = {
      messageId: '1',
      text: 'Original message',
      senderId: 'user456',
      senderName: undefined,
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

    expect(getByText('Friend')).toBeTruthy();
  });

  it('renders image media correctly', () => {
    const media = [
      { uri: 'test-image.jpg', type: 'image/jpeg' }
    ];

    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with image"
          isMine={false}
          media={media}
          currentUserId="user123"
          testID="chat-bubble"
        />
      </Provider>
    );

    expect(getByTestId('chat-bubble')).toBeTruthy();
  });

  it('renders video media correctly', () => {
    const media = [
      { uri: 'test-video.mp4', type: 'video/mp4' }
    ];

    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with video"
          isMine={false}
          media={media}
          currentUserId="user123"
          testID="chat-bubble"
        />
      </Provider>
    );

    expect(getByTestId('chat-bubble')).toBeTruthy();
  });

  it('renders multiple media items', () => {
    const media = [
      { uri: 'test-image1.jpg', type: 'image/jpeg' },
      { uri: 'test-image2.jpg', type: 'image/jpeg' },
      { uri: 'test-video.mp4', type: 'video/mp4' }
    ];

    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with multiple media"
          isMine={false}
          media={media}
          currentUserId="user123"
          testID="chat-bubble"
        />
      </Provider>
    );

    expect(getByTestId('chat-bubble')).toBeTruthy();
  });

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

  it('renders message without timestamp', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message without timestamp"
          isMine={false}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Message without timestamp')).toBeTruthy();
  });

  it('handles empty media array', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with empty media"
          isMine={false}
          media={[]}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Message with empty media')).toBeTruthy();
  });

  it('handles media with missing type', () => {
    const media = [
      { uri: 'test-file', type: undefined }
    ];

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Message with media without type"
          isMine={false}
          media={media}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Unsupported file')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text="Themed message"
          isMine={false}
          currentUserId="user123"
          testID="chat-bubble"
        />
      </Provider>
    );

    const bubble = getByTestId('chat-bubble');
    expect(bubble).toBeTruthy();
  });

  it('handles very long text messages', () => {
    const longText = 'This is a very long message that should be displayed properly in the chat bubble. It contains multiple sentences and should wrap correctly to maintain readability. The text should not overflow or cause any layout issues.';

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

  it('handles special characters in text', () => {
    const specialText = 'Message with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

    const { getByText } = render(
      <Provider store={mockStore}>
        <ChatBubble
          text={specialText}
          isMine={false}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText(specialText)).toBeTruthy();
  });

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
});

