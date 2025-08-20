import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { verifyOTP } from '../../services/firebase/auth';
import Toast from 'react-native-toast-message';
import { useRoute, useNavigation } from '@react-navigation/native';

const VerifyOTPContainer = () => {
  const [otp, setOtp] = useState('');
  const route = useRoute<any>();
  const nav = useNavigation();
  const email = route.params?.email;

  const onVerify = async () => {
    const ok = await verifyOTP(email, otp);
    if (ok) {
      // @ts-ignore
      nav.navigate('ResetPassword', { email });
    } else {
      Toast.show({ type: 'error', text1: 'Invalid OTP' });
    }
  };

  return (
    <View style={styles.container}>
      <CustomTextInput value={otp} onChangeText={setOtp} placeholder="123456" />
      <CustomButton title="Verify" onPress={onVerify} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: '#fff', justifyContent: 'center' } });

export default VerifyOTPContainer;
