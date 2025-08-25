
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';

interface ChatBubbleProps {
  text: string;
  isMine?: boolean;
  timestamp?: number;
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
    senderName?: string;
  };
  onLongPress?: () => void;
  currentUserId?: string;
}

const formatTime = (timestamp?: number): string => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatBubble = ({ text, isMine = false, timestamp, replyTo, onLongPress, currentUserId }: ChatBubbleProps) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const renderReplyContext = () => {
    if (!replyTo) return null;
    
    const isReplyToMe = replyTo.senderId === currentUserId;
    const replyAuthor = isReplyToMe ? t('chat.you') : (replyTo.senderName || t('chat.friend'));
    
    return (
      <View style={[styles.replyContainer, { borderLeftColor: isMine ? '#ffffff80' : colors.primary }]}>
        <Text style={[styles.replySender, { color: isMine ? '#ffffffcc' : colors.text + 'cc' }]}>
          {replyAuthor}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.replyText, { color: isMine ? '#ffffff99' : colors.text + '99' }]}
        >
          {replyTo.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.messageRow, isMine ? styles.myMessageRow : styles.theirMessageRow]}>
      <Pressable
        style={[
          styles.bubble,
          isMine
            ? {
                backgroundColor: colors.primary,
                borderBottomRightRadius: 4,
              }
            : {
                backgroundColor: colors.card,
                borderBottomLeftRadius: 4,
              },
        ]}
        onLongPress={onLongPress}
        delayLongPress={500}
      >
        {renderReplyContext()}
        <Text style={[styles.messageText, { color: isMine ? '#fff' : colors.text }]}>
          {text}
        </Text>
        {timestamp && (
          <Text style={[styles.timestamp, { color: isMine ? '#fff' : colors.text, opacity: 0.7 }]}>
            {formatTime(timestamp)}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  messageRow: {
    marginVertical: 3,
    paddingHorizontal: 4,
  },
  myMessageRow: {
    alignItems: 'flex-end',
  },
  theirMessageRow: {
    alignItems: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
    minWidth: 60,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 8,
    opacity: 0.9,
  },
  replySender: {
    fontSize: 14,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.8,
  },
});

export default ChatBubble;