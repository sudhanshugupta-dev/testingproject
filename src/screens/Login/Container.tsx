// import React, { useState } from 'react';
// import { View, StyleSheet, Pressable, Text } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import CustomTextInput from '../../components/CustomTextInput';
// import CustomButton from '../../components/CustomButton';
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch, RootState } from '../../redux/store';
// import { loginWithEmail } from '../../redux/slices/authSlice';
// import { restoreAuth } from '../../redux/slices/authSlice';
// import Toast from 'react-native-toast-message';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { useNavigation } from '@react-navigation/native';
// import { RootStackParamList } from '../../navigation/RootNavigator';
// import { useAppTheme } from '../../themes/useTheme';
// import GoogleSignUpButton from '../../components/GoogleButton';
// import { signInWithGoogle } from '../../services/firebase/auth';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const LoginContainer = () => {
//   const { t } = useTranslation();
//   const dispatch = useDispatch<AppDispatch>();
//   const loading = useSelector((s: RootState) => s.auth.loading);
//   const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
//   const { colors } = useAppTheme();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const onLogin = async () => {
//     if (!email || !password) {
//       Toast.show({ type: 'error', text1: t('auth.error.fillAllFields') });
//       return;
//     }
//     const res = await dispatch(loginWithEmail({ email, password }));
//     if ((res as any).error) {
//       Toast.show({ type: 'error', text1: t('auth.error.loginFailed') });
//     } else {
//       nav.reset({ index: 0, routes: [{ name: 'Main' }] });
//     }
//   };

//   const onSignInWithGoogle = async () => {
//     try {
//       const result = await signInWithGoogle();
//       const token = await result.user.getIdToken();
//        console.log("token0", result);
//       await AsyncStorage.setItem('token', token);
//       await AsyncStorage.setItem(
//         'user',
//         JSON.stringify({ uid: result.user.uid, email: result.user.email })
//       );
     
//       dispatch(restoreAuth({ token, user: { uid: result.user.uid, email: result.user.email } }));
//       nav.reset({ index: 0, routes: [{ name: 'Main' }] }); // Verify 'Main' exists
//     } catch (error: any) {
//       console.error('Google Sign-In error:', error);
//       Toast.show({
//         type: 'error',
//         text1: t('auth.error.googleLoginFailed'),
//         text2: error.message || 'Unknown error',
//       });
//     }
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       <CustomTextInput
//         label={t('auth.email')}
//         value={email}
//         onChangeText={setEmail}
//         placeholder={t('auth.placeholders.email')}
//       />
//       <CustomTextInput
//         label={t('auth.password')}
//         value={password}
//         onChangeText={setPassword}
//         placeholder={t('auth.placeholders.password')}
//         secureTextEntry
//       />
//       <CustomButton
//         title={t('auth.login')}
//         onPress={onLogin}
//         loading={loading}
//       />
//       <Pressable onPress={() => nav.navigate('Signup')}>
//         <Text style={[styles.link, { color: colors.primary }]}>
//           {t('auth.signup')}
//         </Text>
//       </Pressable>
//       <Pressable onPress={() => nav.navigate('ForgotPassword')}>
//         <Text style={[styles.link, { color: colors.primary }]}>
//           {t('auth.forgot')}
//         </Text>
//       </Pressable>
//       <GoogleSignUpButton onPress={onSignInWithGoogle} title= {t('auth.loginGoogle')} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, justifyContent: 'center' },
//   link: { textAlign: 'center', marginTop: 15, fontSize: 16, fontWeight: '900' },
// });

// export default LoginContainer;


import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/store';
import { loginWithEmail } from '../../redux/slices/authSlice';
import { restoreAuth } from '../../redux/slices/authSlice';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAppTheme } from '../../themes/useTheme';
import GoogleSignUpButton from '../../components/GoogleButton';
import { signInWithGoogle } from '../../services/firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginContainer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((s: RootState) => s.auth.loading);
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: t('auth.error.fillAllFields') });
      return;
    }
    const res = await dispatch(loginWithEmail({ email, password }));
    if ((res as any).error) {
      Toast.show({ type: 'error', text1: t('auth.error.loginFailed') });
    } else {
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  };

  const onSignInWithGoogle = async () => {
    try {
      setGoogleLoading(true);
      const result = await signInWithGoogle();
      const token = await result.user.getIdToken();
      console.log("token", result);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem(
        'user',
        JSON.stringify({ uid: result.user.uid, email: result.user.email, name: result.user.displayName })
      );
      dispatch(restoreAuth({ token, user: { uid: result.user.uid, email: result.user.email,  name: result.user.displayName
} }));
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Toast.show({
        type: 'error',
        text1: t('auth.error.googleLoginFailed'),
        text2: error.message || 'Unknown error',
      });
    } finally {
      setGoogleLoading(false);
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
      <CustomButton
        title={t('auth.login')}
        onPress={onLogin}
        loading={loading}
      />
      <Pressable onPress={() => nav.navigate('Signup')}>
        <Text style={[styles.link, { color: colors.primary }]}>
          {t('auth.signup')}
        </Text>
      </Pressable>
      <Pressable onPress={() => nav.navigate('ForgotPassword')}>
        <Text style={[styles.link, { color: colors.primary }]}>
          {t('auth.forgot')}
        </Text>
      </Pressable>
      <View style={styles.googleButtonContainer}>
        <GoogleSignUpButton
          onPress={onSignInWithGoogle}
          title={t('auth.loginGoogle')}
          disabled={googleLoading}
        />
        {googleLoading && (
          <ActivityIndicator
            style={styles.loader}
            size="small"
            color={colors.primary}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  link: { textAlign: 'center', marginTop: 15, fontSize: 16, fontWeight: '900' },
  googleButtonContainer: { position: 'relative', marginTop: 15 },
  loader: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
});

export default LoginContainer;