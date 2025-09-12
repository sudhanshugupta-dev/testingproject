import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { resetPassword } from '../../services/firebase/auth';
import Toast from 'react-native-toast-message';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import { createStyles } from './styles';

const ResetPasswordContainer = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const route = useRoute<any>();
  const nav = useNavigation();
  const email = route.params?.email;
  const { colors, mode } = useAppTheme();
  const styles = createStyles(mode);
  const { t } = useTranslation();

  const onReset = async () => {
    if (!password || password !== confirm) {
      Toast.show({ type: 'error', text1: 'Passwords must match' });
      return;
    }
    try {
      await resetPassword(password);
      Toast.show({ type: 'success', text1: 'Password reset' });
      // @ts-ignore
      nav.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e?.message || 'Failed to reset' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <CustomTextInput value={password} onChangeText={setPassword} placeholder={t('auth.password')} secureTextEntry />
      <CustomTextInput value={confirm} onChangeText={setConfirm} placeholder={t('auth.confirmPassword')} secureTextEntry />
      <CustomButton title={t('auth.resetPassword')} onPress={onReset} />
    </View>
  );
};


export default ResetPasswordContainer;
