import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import { useAppTheme } from '../../themes';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../redux/store';
import { bootstrapApp } from '../../redux/slices/appBootstrap';

const SplashContainer = () => {
  const { t } = useTranslation();
  const opacity = new Animated.Value(0);
  const { colors } = useAppTheme();
  const dispatch = useDispatch<AppDispatch>();

  const handleNavigateNext = () => {
    dispatch(bootstrapApp());
  };

  const fallbackTimeout = setTimeout(() => {
    handleNavigateNext();
  }, 9000); // 6 seconds fallback

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
    
    // Cleanup timeout on unmount
    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <LottieView source={require('../../assets/Chatbot.json')} autoPlay loop style={{ width: 160, height: 160 }} />
      <Animated.Text style={[styles.title, { opacity, color: colors.text }]}>{t('app.title')}</Animated.Text>
      {/* <Text style={[styles.subtitle, { color: colors.text, opacity: 0.6 }]}>Loading...</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, alignItems: 'center', justifyContent: 'center' }, title: { fontSize: 28, fontWeight: '700', marginTop: 12 }, subtitle: { marginTop: 10 } });

export default SplashContainer;
