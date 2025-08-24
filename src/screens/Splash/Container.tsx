import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { useAppTheme } from '../../themes/useTheme';

const SplashContainer = () => {
  const { t } = useTranslation();
  const opacity = new Animated.Value(0);
  const { colors } = useAppTheme();

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LottieView source={require('../../assets/Chatbot.json')} autoPlay loop style={{ width: 160, height: 160 }} />
      <Animated.Text style={[styles.title, { opacity, color: colors.text }]}>{t('app.title')}</Animated.Text>
      <Text style={[styles.subtitle, { color: colors.text, opacity: 0.6 }]}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 28, fontWeight: '700', marginTop: 12 }, subtitle: { marginTop: 10 } });

export default SplashContainer;
