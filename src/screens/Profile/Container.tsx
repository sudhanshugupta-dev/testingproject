import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import CustomAvatar from '../../components/CustomAvatar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { setLanguage } from '../../redux/slices/languageSlice';
import { logout } from '../../redux/slices/authSlice';

const ProfileContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const theme = useSelector((s: RootState) => s.theme.mode);
  const lang = useSelector((s: RootState) => s.language.code);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginVertical: 24 }}>
        <CustomAvatar name={user?.email || 'User'} size={72} />
        <Text style={styles.email}>{user?.email}</Text>
      </View>
      <Pressable style={styles.row} onPress={() => dispatch(toggleTheme())}>
        <Text style={styles.label}>Theme</Text>
        <Text style={styles.value}>{theme}</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={() => dispatch(setLanguage(lang === 'en' ? 'hi' : 'en'))}>
        <Text style={styles.label}>Language</Text>
        <Text style={styles.value}>{lang}</Text>
      </Pressable>
      <Pressable style={[styles.row, { borderColor: '#EF4444' }]} onPress={() => dispatch(logout())}>
        <Text style={[styles.label, { color: '#EF4444' }]}>Logout</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#fff', padding: 16 }, email: { marginTop: 8, color: '#6B7280' }, row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between' }, label: { fontWeight: '700', color: '#111827' }, value: { color: '#6B7280' } });

export default ProfileContainer;
