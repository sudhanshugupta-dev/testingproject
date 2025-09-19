import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';

interface ReplyMessageBarProps {
  replyMessage: {
    id: string;
    text: string;
    senderId: string;
    senderName?: string;
  };
  onCancel: () => void;
  currentUserId?: string;
  testID?: string;
}

const ReplyMessageBar = ({ replyMessage, onCancel, currentUserId, testID = 'reply-bar' }: ReplyMessageBarProps) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  
  const isMyMessage = replyMessage.senderId === currentUserId;
  const displayName = isMyMessage ? t('chat.you') : (replyMessage.senderName || t('chat.friend'));
  
  // Truncate long messages
  const truncatedText = replyMessage.text.length > 50 
    ? replyMessage.text.substring(0, 50) + '...' 
    : replyMessage.text;

  return (
    <View testID={testID} style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.text + '22' }]}> 
      <View testID="reply-indicator" style={[styles.replyIndicator, { backgroundColor: colors.primary }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons 
            name="reply" 
            size={18} 
            color={colors.primary} 
            style={styles.replyIcon}
          />
          <Text style={[styles.replyToText, { color: colors.primary }]}>
            {t('chat.replyingTo')} {displayName}
          </Text>
        </View>
        <Text style={[styles.messageText, { color: colors.text, opacity: 0.8 }]} numberOfLines={2}>
          {truncatedText}
        </Text>
      </View>
      <Pressable testID="cancel-button" style={styles.cancelButton} onPress={onCancel}>
        <MaterialIcons name="close" size={24} color={colors.text} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    minHeight: 60,
  },
  replyIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 40,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyIcon: {
    marginRight: 6,
  },
  replyToText: {
    fontSize: 12,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  cancelButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
  },
});

export default ReplyMessageBar;
