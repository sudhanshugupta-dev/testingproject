

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAvatar from '../../components/CustomAvatar';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { logout } from '../../redux/slices/authSlice';
import LanguageModal from '../../components/LanguageModal';
import { useAppTheme } from '../../themes/useTheme';
import { createStyles } from './styles';
import { useTranslation } from 'react-i18next';
import { RouteProp, useRoute } from '@react-navigation/native';

const ProfileContainer = () => {
  const route = useRoute();
  const { hideLabels , name } = route.params || {}; // 👈 get props

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const theme = useSelector((s: RootState) => s.theme.mode);
  //const name  = useSelector((s:RootState) => s.auth.user?.name);
  const lang = useSelector((s: RootState) => s.language.code);
  const { colors, mode } = useAppTheme();
  const styles = createStyles(mode);
  const [showLang, setShowLang] = useState(false);
  const { t } = useTranslation();
 console.log("user", user)


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <CustomAvatar name={user?.email || name} size={90} />
        <Text style={[styles.email, { color: colors.text }]}>{user?.name || user?.email}</Text>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        {/* Theme Toggle */}
        <Pressable style={[styles.row, { backgroundColor: colors.card }]}>
          <View style={styles.rowLeft}>
            <Icon
              name={theme === 'dark' ? 'moon-outline' : 'sunny-outline'}
              size={22}
              color={colors.primary}
              style={styles.icon}
            />
            {!hideLabels && <Text style={[styles.label, { color: colors.text }]}>{t('profile.theme')}</Text>}
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={() => dispatch(toggleTheme())}
            trackColor={{ false: '#D1D5DB', true: colors.primary }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D1D5DB"
          />
        </Pressable>

        {/* Language Selector */}
        <Pressable
          style={[styles.row, { backgroundColor: colors.card }]}
          onPress={() => setShowLang(true)}
        >
          <View style={styles.rowLeft}>
            <Icon name="language-outline" size={22} color={colors.primary} style={styles.icon} />
            {!hideLabels && <Text style={[styles.label, { color: colors.text }]}>{t('profile.language')}</Text>}
          </View>
          <Text style={[styles.value, { color: colors.text }]}>{lang.toUpperCase()}</Text>
        </Pressable>

        {/* Logout */}
        <Pressable style={[styles.row, { backgroundColor: colors.card }]} onPress={() => dispatch(logout())}>
          <View style={styles.rowLeft}>
            <Icon name="log-out-outline" size={22} color="#EF4444" style={styles.icon} />
            {!hideLabels && <Text style={[styles.label, { color: '#EF4444' }]}>{t('profile.logout')}</Text>}
          </View>
        </Pressable>
      </View>

      <LanguageModal visible={showLang} onClose={() => setShowLang(false)} />
    </View>
  );
};


export default ProfileContainer;
