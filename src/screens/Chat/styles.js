import { StyleSheet } from 'react-native';
import { getThemeColors } from '../../themes';

// Create theme-aware styles function
export const createStyles = (mode = 'light') => {
  const colors = getThemeColors(mode);
  return StyleSheet.create({
    container: { 
      flex: 1 
    },

    searchBar: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInput: {
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 40,
      fontSize: 16,
      backgroundColor: colors.card,
      color: colors.text,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    name: { 
      fontWeight: '600', 
      fontSize: 16,
      color: colors.text,
    },
    last: { 
      marginTop: 4, 
      fontSize: 14,
      color: colors.textSecondary,
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: 80,
    },
    emptyText: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
      paddingHorizontal: 20,
      color: colors.textSecondary,
    },
    unreadBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
      backgroundColor: colors.primary,
    },
    unreadText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: 'bold',
    },
    timestamp: {
      fontSize: 12,
      fontWeight: '400',
    },
    createGroupFab: {
      position: 'absolute',
      bottom: 120,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      zIndex: 1000,
    },
  });
};

// Backward compatibility - default light theme styles
export const styles = createStyles('light');
