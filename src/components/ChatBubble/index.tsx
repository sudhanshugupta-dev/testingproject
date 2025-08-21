import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../themes/useTheme';

const ChatBubble = ({ text, isMine }: { text: string; isMine?: boolean }) => {
  const { colors } = useAppTheme();
  const mineStyle = { alignSelf: 'flex-end' as const, backgroundColor: colors.primary };
  const theirsStyle = { alignSelf: 'flex-start' as const, backgroundColor: colors.card };
  return (
    <View style={[styles.container, isMine ? mineStyle : theirsStyle]}>      
      <Text style={[styles.text, { color: isMine ? '#fff' : colors.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, marginVertical: 6, borderRadius: 12, maxWidth: '80%' },
  text: { },
});

export default ChatBubble;
