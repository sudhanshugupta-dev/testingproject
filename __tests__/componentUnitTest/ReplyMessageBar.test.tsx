import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ReplyMessageBar from '../../src/components/ReplyMessageBar';
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
        'chat.replyingTo': 'Replying to',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');

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

describe('ReplyMessageBar Component', () => {
  const mockReplyMessage = {
    id: '1',
    text: 'This is a reply message',
    senderId: 'user123',
    senderName: 'John Doe',
  };

  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders reply message text', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={mockReplyMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
        />
      </Provider>
    );

    expect(getByText('This is a reply message')).toBeTruthy();
  });

  it('shows "You" when replying to own message', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={mockReplyMessage}
          onCancel={mockOnCancel}
          currentUserId="user123"
        />
      </Provider>
    );

    expect(getByText('Replying to You')).toBeTruthy();
  });

  it('shows sender name when replying to other user', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={mockReplyMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
        />
      </Provider>
    );

    expect(getByText('Replying to John Doe')).toBeTruthy();
  });

  it('shows "Friend" when sender name is not provided', () => {
    const replyMessageWithoutName = {
      ...mockReplyMessage,
      senderName: undefined,
    };

    const { getByText } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={replyMessageWithoutName}
          onCancel={mockOnCancel}
          currentUserId="user456"
        />
      </Provider>
    );

    expect(getByText('Replying to Friend')).toBeTruthy();
  });

  it('truncates long messages', () => {
    const longMessage = {
      ...mockReplyMessage,
      text: 'This is a very long message that should be truncated when it exceeds fifty characters in length',
    };

    const { getByText } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={longMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
        />
      </Provider>
    );

    // The message is 95 characters, so it should be truncated to first 50 + "..."
    expect(getByText('This is a very long message that should be truncat...')).toBeTruthy();
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={mockReplyMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
          testID="reply-bar"
        />
      </Provider>
    );

    const cancelButton = getByTestId('cancel-button');
    fireEvent.press(cancelButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('renders reply indicator', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={mockReplyMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
          testID="reply-bar"
        />
      </Provider>
    );

    expect(getByTestId('reply-indicator')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={mockReplyMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
          testID="reply-bar"
        />
      </Provider>
    );

    const container = getByTestId('reply-bar');
    expect(container.props.style).toContainEqual(
      expect.objectContaining({
        backgroundColor: mockTheme.colors.card,
      })
    );
  });

  it('handles empty message text', () => {
    const emptyMessage = {
      ...mockReplyMessage,
      text: '',
    };

    const { getByText } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={emptyMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
        />
      </Provider>
    );

    expect(getByText('Replying to John Doe')).toBeTruthy();
  });

  it('handles message with exactly 50 characters', () => {
    const exactMessage = {
      ...mockReplyMessage,
      text: 'This message has exactly fifty characters in length',
    };

    const { getByText } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={exactMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
        />
      </Provider>
    );

    // Message is 51 characters, so it should be truncated to first 50 + "..."
    expect(getByText('This message has exactly fifty characters in lengt...')).toBeTruthy();
  });

  it('handles message with 49 characters', () => {
    const shortMessage = {
      ...mockReplyMessage,
      text: 'This message has forty-nine characters in length',
    };

    const { getByText } = render(
      <Provider store={mockStore}>
        <ReplyMessageBar
          replyMessage={shortMessage}
          onCancel={mockOnCancel}
          currentUserId="user456"
        />
      </Provider>
    );

    expect(getByText('This message has forty-nine characters in length')).toBeTruthy();
  });
});


