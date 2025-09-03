import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { signupWithEmail, restoreAuth } from '../../redux/slices/authSlice';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import GoogleSignUpButton from '../../components/GoogleButton';
import { useAppTheme } from '../../themes/useTheme';
import { signInWithGoogle } from '../../services/firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SignupContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((s: RootState) => s.auth.loading);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useAppTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSignup = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: t('auth.error.fillAllFields') });
      return;
    }
    if (password !== confirm) {
      Toast.show({ type: 'error', text1: t('auth.error.passwordMismatch') });
      return;
    }
    const res = await dispatch(signupWithEmail({ email, password }));
    if ((res as any).error) {
      Toast.show({ type: 'error', text1: t('auth.error.signupFailed') });
    } else {
      // @ts-ignore
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const onGoogleSignup = async () => {
    try {
      const result = await signInWithGoogle();
      const token = await result.user.getIdToken();
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem(
        'user',
        JSON.stringify({ uid: result.user.uid, email: result.user.email })
      );
      dispatch(restoreAuth({ token, user: { uid: result.user.uid, email: result.user.email } }));
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: t('auth.error.googleLoginFailed'),
        text2: error?.message || 'Unknown error',
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomTextInput
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        placeholder={t('auth.placeholders.email')}
      />
      <CustomTextInput
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        placeholder={t('auth.placeholders.password')}
        secureTextEntry
      />
      <CustomTextInput
        label={t('auth.confirmPassword')}
        value={confirm}
        onChangeText={setConfirm}
        placeholder={t('auth.placeholders.password')}
        secureTextEntry
      />
      <CustomButton
        title={t('auth.signup')}
        onPress={onSignup}
        loading={loading}
      />

      <Pressable onPress={() => nav.navigate('Login')}>
        <Text style={[styles.link, { color: colors.primary }]}>
          {t('auth.login')}
        </Text>
      </Pressable>
      <GoogleSignUpButton onPress={onGoogleSignup} title={t('auth.signupGoogle')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  link: { textAlign: 'center', marginTop: 15, fontSize: 16, fontWeight: '900' },
});

export default SignupContainer;
