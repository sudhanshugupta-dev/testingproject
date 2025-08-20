import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const initialsFromName = (name?: string) => {
  if (!name) return 'NA';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
};

const CustomAvatar = ({ name, size = 48 }: { name?: string; size?: number }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}> 
      <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initialsFromName(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' }, text: { color: '#fff', fontWeight: '700' } });

export default CustomAvatar;
