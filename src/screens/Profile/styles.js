import { StyleSheet, Platform } from 'react-native';
import { getThemeColors } from '../../themes';

// Create theme-aware styles function
export const createStyles = (mode = 'light') => {
  const colors = getThemeColors(mode);
  return StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 16, 
      paddingTop: Platform.OS === 'ios' ? 44 : 24,
      backgroundColor: colors.background,
    },
    header: { 
      alignItems: 'center', 
      marginVertical: 24, 
      padding: 16 
    },
    email: { 
      marginTop: 12, 
      fontSize: 18, 
      fontWeight: '600', 
      letterSpacing: 0.3,
      color: colors.text,
    },
    section: { 
      marginTop: 16 
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginVertical: 4,
      backgroundColor: colors.card,
    },
    rowLeft: { 
      flexDirection: 'row', 
      alignItems: 'center' 
    },
    icon: { 
      marginRight: 12 
    },
    label: { 
      fontSize: 16, 
      fontWeight: '500',
      color: colors.text,
    },
    value: { 
      fontSize: 16, 
      fontWeight: '400',
      color: colors.textSecondary,
    },
  });
};

// Backward compatibility - default light theme styles
export const styles = createStyles('light');
