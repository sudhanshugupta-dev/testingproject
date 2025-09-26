import { StyleSheet } from 'react-native';

export const createStyles = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  
  const colors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    surface: isDark ? '#2d2d2d' : '#f8f9fa',
    text: isDark ? '#ffffff' : '#1a1a1a',
    textSecondary: isDark ? '#a0a0a0' : '#6b7280',
    border: isDark ? '#404040' : '#e5e7eb',
    primary: '#007AFF',
    error: '#ff3b30',
    success: '#34c759',
    warning: '#ff9500',
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.textSecondary,
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    nameSection: {
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    nameDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    groupName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      marginRight: 8,
    },
    editButton: {
      padding: 4,
    },
    editNameContainer: {
      alignItems: 'center',
    },
    nameInput: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      minWidth: 200,
      maxWidth: 300,
    },
    nameActions: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 12,
    },
    cancelButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelText: {
      color: colors.textSecondary,
      fontWeight: '600',
    },
    saveButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.primary,
      minWidth: 60,
      alignItems: 'center',
    },
    saveText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    memberCountSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    memberCount: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    membersSection: {
      paddingHorizontal: 16,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    memberInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    memberDetails: {
      marginLeft: 12,
      flex: 1,
    },
    memberName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    adminBadge: {
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    adminText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#ffffff',
    },
    removeButton: {
      padding: 8,
    },
    addMemberSection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    addMemberButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    addMemberText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.primary,
      marginLeft: 8,
    },
    leaveSection: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    leaveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.error,
    },
    leaveText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.error,
      marginLeft: 8,
    },
  });
};
