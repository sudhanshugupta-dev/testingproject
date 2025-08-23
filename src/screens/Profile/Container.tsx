// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
// import CustomAvatar from '../../components/CustomAvatar';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '../../redux/store';
// import { toggleTheme } from '../../redux/slices/themeSlice';
// import { logout } from '../../redux/slices/authSlice';
// import LanguageModal from '../../components/LanguageModal';
// import { useAppTheme } from '../../themes/useTheme';
// import { useTranslation } from 'react-i18next';

// const ProfileContainer = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const user = useSelector((s: RootState) => s.auth.user);
//   const theme = useSelector((s: RootState) => s.theme.mode);
//   const lang = useSelector((s: RootState) => s.language.code);
//   const { colors } = useAppTheme();
//   const [showLang, setShowLang] = useState(false);
//   const { t } = useTranslation();

 

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>      
//       <View style={{ alignItems: 'center', marginVertical: 24 }}>
//         <CustomAvatar name={user?.email || 'User'} size={72} />
//         <Text style={[styles.email, { color: colors.text }]}>{user?.email}</Text>
//       </View>
//       <View style={styles.row}>
//         <Text style={[styles.label, { color: colors.text }]}>{t('profile.theme')}</Text>
//         <Switch value={theme === 'dark'} onValueChange={() => dispatch(toggleTheme())} />
//       </View>
//       <Pressable style={styles.row} onPress={() => setShowLang(true)}>
//         <Text style={[styles.label, { color: colors.text }]}>{t('profile.language')}</Text>
//         <Text style={[styles.value, { color: colors.text, opacity: 0.8 }]}>{lang.toUpperCase()}</Text>
//       </Pressable>
//       <Pressable style={[styles.row]} onPress={() => dispatch(logout())}>
//         <Text style={[styles.label, { color: '#EF4444' }]}>{t('profile.logout')}</Text>
//       </Pressable>
//       <LanguageModal visible={showLang} onClose={() => setShowLang(false)} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({ container: { flex: 1, padding: 16 }, email: { marginTop: 8 }, row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, label: { fontWeight: '700' }, value: { } });

// export default ProfileContainer;



import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // React Native CLI compatible icons
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <CustomAvatar name={user?.email || 'User'} size={90} />
        <Text style={[styles.email, { color: colors.text }]}>
          {user?.email || t('profile.guest')}
        </Text>
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
            <Text style={[styles.label, { color: colors.text }]}>{t('profile.theme')}</Text>
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
            <Icon name="language-outline" size= {22} color={colors.primary} style={styles.icon} />
            <Text style={[styles.label, { color: colors.text }]}>{t('profile.language')}</Text>
          </View>
          <Text style={[styles.value, { color: colors.text }]}>{lang.toUpperCase()}</Text>
        </Pressable>

        {/* Logout */}
        <Pressable style={[styles.row, { backgroundColor: colors.card }]} onPress={() => dispatch(logout())}>
          <View style={styles.rowLeft}>
            <Icon name="log-out-outline" size={22} color="#EF4444" style={styles.icon} />
            <Text style={[styles.label, { color: '#EF4444' }]}>{t('profile.logout')}</Text>
          </View>
        </Pressable>
      </View>

      <LanguageModal visible={showLang} onClose={() => setShowLang(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // Adjust for status bar
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'transparent', // Relies on theme background
  },
  email: {
    marginTop: 12,
    fontSize: 18, // Slightly smaller but clear
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  section: {
    marginTop: 16,
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4, // Space between rows
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '400',
  },
});

export default ProfileContainer;