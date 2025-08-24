import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import CustomAvatar from '../../components/CustomAvatar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import LanguageModal from '../../components/LanguageModal';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';

const ProfileContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const theme = useSelector((s: RootState) => s.theme.mode);
  const lang = useSelector((s: RootState) => s.language.code);
  const { colors } = useAppTheme();
  const [showLang, setShowLang] = useState(false);
  const { t } = useTranslation();

  useEffect(()=>{
      console.log("language status", showLang)
  }, [showLang])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <View style={{ alignItems: 'center', marginVertical: 24 }}>
        <CustomAvatar name={user?.email || 'User'} size={72} />
        <Text style={[styles.email, { color: colors.text }]}>{user?.email}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.text }]}>{t('profile.theme')}</Text>
        <Switch value={theme === 'dark'} onValueChange={() => dispatch(toggleTheme())} />
      </View>
      <Pressable style={styles.row} onPress={() => setShowLang(true)}>
        <Text style={[styles.label, { color: colors.text }]}>{t('profile.language')}</Text>
        <Text style={[styles.value, { color: colors.text, opacity: 0.8 }]}>{lang.toUpperCase()}</Text>
      </Pressable>
      <Pressable style={[styles.row]} onPress={() => dispatch(logout())}>
        <Text style={[styles.label, { color: '#EF4444' }]}>{t('profile.logout')}</Text>
      </Pressable>
      <LanguageModal visible={showLang} onClose={() => setShowLang(false)} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, email: { marginTop: 8 }, row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, label: { fontWeight: '700' }, value: { } });

export default ProfileContainer;
