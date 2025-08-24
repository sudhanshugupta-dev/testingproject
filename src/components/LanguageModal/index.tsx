import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { setLanguage } from '../../redux/slices/languageSlice';
import { useAppTheme } from '../../themes/useTheme';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'fr', label: 'Français' },
  { code: 'ja', label: '日本語' },
] as const;

type Props = { visible: boolean; onClose: () => void };

const LanguageModal = ({ visible, onClose }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { colors } = useAppTheme();
  const current = useSelector((s: RootState) => s.language.code);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>          
          <Text style={[styles.title, { color: colors.text }]}>Select Language</Text>
          {LANGS.map(l => (
            <Pressable key={l.code} onPress={() => { dispatch(setLanguage(l.code as any)); onClose(); }} style={styles.row}>
              <Text style={[styles.label, { color: colors.text, opacity: current === l.code ? 1 : 0.8 }]}>
                {l.label} {current === l.code ? '✓' : ''}
              </Text>
            </Pressable>
          ))}
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#0007', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16 },
  title: { fontWeight: '700', fontSize: 18, marginBottom: 8 },
  row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#00000022' },
  label: { fontSize: 16 },
  closeBtn: { marginTop: 12, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#4F46E5', borderRadius: 24 },
  closeText: { color: '#fff', fontWeight: '700' },
});

export default LanguageModal; 