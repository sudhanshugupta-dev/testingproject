import { StyleSheet } from 'react-native';
import { getThemeColors } from '../../themes';

// Create theme-aware styles function
export const createStyles = (mode = 'light') => {
  const colors = getThemeColors(mode);
  return StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 16, 
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    messageText: {
      textAlign: 'center',
      fontSize: 18,
      marginBottom: 16,
      color: colors.text,
    },
  });
};

// Backward compatibility - default light theme styles
export const styles = createStyles('light');
