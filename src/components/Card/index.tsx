import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../themes/useTheme';

type Props = { children: ReactNode; style?: ViewStyle; testID?: string };

const Card = ({ children, style, testID = 'card' }: Props) => {
  const { colors } = useAppTheme();
  return <View testID={testID} style={[styles.base, { backgroundColor: colors.card, borderColor: colors.text + '22' }, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});

export default Card; 