import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';

const SplashContainer = () => {
  const { t } = useTranslation();
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.title, { opacity }]}>{t('app.title')}</Animated.Text>
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center' }, title: { color: '#fff', fontSize: 28, fontWeight: '700' }, subtitle: { color: '#9CA3AF', marginTop: 10 } });

export default SplashContainer;
