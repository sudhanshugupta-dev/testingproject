import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { setLanguage } from '../../redux/slices/languageSlice';

const LanguageContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const lang = useSelector((s: RootState) => s.language.code);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Language</Text>
      {(['en', 'hi', 'es'] as const).map((l) => (
        <Pressable key={l} style={styles.row} onPress={() => dispatch(setLanguage(l))}>
          <Text style={[styles.label, lang === l && styles.active]}>{l.toUpperCase()}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#fff', padding: 16 }, title: { fontWeight: '700', fontSize: 18, marginBottom: 8 }, row: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }, label: { color: '#111827' }, active: { color: '#4F46E5', fontWeight: '700' } });

export default LanguageContainer;
