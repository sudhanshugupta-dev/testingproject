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
    link: { 
      textAlign: 'center', 
      marginTop: 15, 
      fontSize: 16, 
      fontWeight: '900',
      color: colors.primary,
    },
  });
};

// Backward compatibility - default light theme styles
export const styles = createStyles('light');
