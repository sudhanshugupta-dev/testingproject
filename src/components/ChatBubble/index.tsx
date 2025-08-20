import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatBubble = ({ text, isMine }: { text: string; isMine?: boolean }) => {
  return (
    <View style={[styles.container, isMine ? styles.mine : styles.theirs]}>
      <Text style={[styles.text, isMine && { color: '#fff' }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, marginVertical: 6, borderRadius: 12, maxWidth: '80%' },
  mine: { alignSelf: 'flex-end', backgroundColor: '#4F46E5' },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#E5E7EB' },
  text: { color: '#111827' },
});

export default ChatBubble;
