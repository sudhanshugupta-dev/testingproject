import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { signupWithEmail } from '../../redux/slices/authSlice';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';

const SignupContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((s: RootState) => s.auth.loading);
  const nav = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSignup = async () => {
    if (!email || !password || password !== confirm) {
      Toast.show({ type: 'error', text1: 'Check form inputs' });
      return;
    }
    const res = await dispatch(signupWithEmail({ email, password }));
    if ((res as any).error) {
      Toast.show({ type: 'error', text1: 'Signup failed' });
    } else {
      // @ts-ignore
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  return (
    <View style={styles.container}>
      <CustomTextInput label={t('auth.email')} value={email} onChangeText={setEmail} placeholder="you@example.com" />
      <CustomTextInput label={t('auth.password')} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
      <CustomTextInput label={t('auth.confirmPassword')} value={confirm} onChangeText={setConfirm} placeholder="••••••••" secureTextEntry />
      <CustomButton title={loading ? '...' : t('auth.signup')} onPress={onSignup} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' } });

export default SignupContainer;
