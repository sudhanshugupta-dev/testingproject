import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { sendPasswordResetOTP } from '../../services/firebase/auth';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../themes/useTheme';
import { createStyles } from './styles';

const ForgotPasswordContainer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const nav = useNavigation();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(mode);

  const onSend = async () => {
    try {
      await sendPasswordResetOTP(email);
      Toast.show({ type: 'success', text1: 'OTP sent (check email)' });
      // @ts-ignore
      nav.navigate('VerifyOTP', { email });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e?.message || 'Failed to send OTP' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      <CustomTextInput label={t('auth.email')} value={email} onChangeText={setEmail} placeholder="you@example.com" />
      <CustomButton title={t('auth.sendOtp')} onPress={onSend} />
    </View>
  );
};


export default ForgotPasswordContainer;
