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
    googleButtonContainer: { 
      position: 'relative', 
      marginTop: 15 
    },
    loader: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: [{ translateY: -10 }],
    },
  });
};

// Backward compatibility - default light theme styles
export const styles = createStyles('light');
