import { StyleSheet } from 'react-native';
import { getThemeColors } from '../../themes';

// Create theme-aware styles function
export const createStyles = (mode = 'light') => {
  const colors = getThemeColors(mode);
  return StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 16,
      backgroundColor: colors.background,
    },
    title: { 
      fontWeight: '700', 
      fontSize: 18, 
      marginBottom: 8,
      color: colors.text,
    },
    row: { 
      paddingVertical: 12, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border,
    },
    label: { 
      color: colors.text,
    },
  });
};

// Backward compatibility - default light theme styles
export const styles = createStyles('light');
