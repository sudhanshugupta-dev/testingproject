import { StyleSheet } from 'react-native';
import { getThemeColors } from '../../themes';

// Create theme-aware styles function
export const createStyles = (mode = 'light') => {
  const colors = getThemeColors(mode);
  return StyleSheet.create({
    container: { 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    title: { 
      fontSize: 28, 
      fontWeight: '700', 
      marginTop: 12,
      color: colors.text,
    },
    subtitle: { 
      marginTop: 10,
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
};

// Backward compatibility - default light theme styles
export const styles = createStyles('light');
