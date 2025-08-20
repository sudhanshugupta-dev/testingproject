import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { resetPassword } from '../../services/firebase/auth';
import Toast from 'react-native-toast-message';
import { useRoute, useNavigation } from '@react-navigation/native';

const ResetPasswordContainer = () => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const route = useRoute<any>();
  const nav = useNavigation();
  const email = route.params?.email;

  const onReset = async () => {
    if (!password || password !== confirm) {
      Toast.show({ type: 'error', text1: 'Passwords must match' });
      return;
    }
    try {
      await resetPassword(email, password);
      Toast.show({ type: 'success', text1: 'Password reset' });
      // @ts-ignore
      nav.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e?.message || 'Failed to reset' });
    }
  };

  return (
    <View style={styles.container}>
      <CustomTextInput value={password} onChangeText={setPassword} placeholder="New Password" secureTextEntry />
      <CustomTextInput value={confirm} onChangeText={setConfirm} placeholder="Confirm Password" secureTextEntry />
      <CustomButton title="Reset" onPress={onReset} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' } });

export default ResetPasswordContainer;
