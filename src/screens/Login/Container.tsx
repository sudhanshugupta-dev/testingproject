import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { loginWithEmail } from '../../redux/slices/authSlice';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';

const LoginContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((s: RootState) => s.auth.loading);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Please enter email and password' });
      return;
    }
    const res = await dispatch(loginWithEmail({ email, password }));
    if ((res as any).error) {
     Toast.show({ type: 'error', text1: 'Login failed' });
      
    } else {
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  return (
    <View style={styles.container}>
      <CustomTextInput label={t('auth.email')} value={email} onChangeText={setEmail} placeholder="you@example.com" />
      <CustomTextInput label={t('auth.password')} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
      <CustomButton title={loading ? '...' : t('auth.login')} onPress={onLogin} />
      <Pressable onPress={() => nav.navigate('Signup')}><Text style={styles.link}>{t('auth.signup')}</Text></Pressable>
      <Pressable onPress={() => nav.navigate('ForgotPassword')}><Text style={styles.link}>{t('auth.forgot')}</Text></Pressable>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' }, link: { color: '#4F46E5', textAlign: 'center', marginTop: 12 } });

export default LoginContainer;
