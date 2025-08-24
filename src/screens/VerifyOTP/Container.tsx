import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import CustomTextInput from '../../components/CustomTextInput';
import CustomButton from '../../components/CustomButton';
import { verifyOTP } from '../../services/firebase/auth';
import Toast from 'react-native-toast-message';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';


const VerifyOTPContainer = () => {
  const [otp, setOtp] = useState('');
  const route = useRoute<any>();
  const nav = useNavigation();
  const email = route.params?.email;
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const onVerify = async () => {
    const ok = await verifyOTP(email, otp);
    if (ok) {
      // @ts-ignore
      nav.navigate('ResetPassword', { email });
    } else {
      Toast.show({ type: 'error', text1: 'Invalid OTP' });
    }
  };
  useEffect(()=>{
       setTimeout(()=>{
             nav.navigate('Login');
       },2000)
  },[])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>      
      {/* <CustomTextInput value={otp} onChangeText={setOtp} placeholder="123456" /> */}
      <Text style={{ textAlign:'center', fontSize:18, marginBottom:16}}>Check your mail  for rest Password</Text>
      <CustomButton title={t('auth.verifyOtp')} onPress={onVerify} />
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, justifyContent: 'center' } });

export default VerifyOTPContainer;
