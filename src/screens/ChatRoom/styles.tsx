import { StyleSheet } from 'react-native';
import { getThemeColors } from '../../themes';

// Create theme-aware styles function
export const createStyles = (mode: 'light' | 'dark') => {
  const colors = getThemeColors(mode);
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    messageList: {
      flex: 1,
      paddingHorizontal: 12,
    },
    messageListContent: {
      padding: 12,
      flexGrow: 1,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      minHeight: 60,
    },
    input: {
      flex: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginHorizontal: 8,
      maxHeight: 100,
      backgroundColor: colors.card,
      color: colors.text,
    },
    sendBtn: {
      borderRadius: 12,
      padding: 10,
      backgroundColor: colors.primary,
    },
    sendBtnDisabled: {
      backgroundColor: colors.disabled,
    },
    sendText: {
      color: colors.background,
      fontWeight: '700',
      fontSize: 16,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: colors.danger,
      textAlign: 'center',
      marginBottom: 20,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    timestamp: {
      fontSize: 12,
      fontWeight: '400',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    friendName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    roomInfo: {
      fontSize: 12,
      marginTop: 2,
      color: colors.textSecondary,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: colors.textSecondary,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    retryButtonText: {
      color: colors.background,
      fontWeight: '600',
    },
    separatorContainer: {
      alignItems: 'center',
      marginVertical: 10,
    },
    separatorText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    attachButton: {
      padding: 8,
    },
    leftAction: {
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginVertical: 4,
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    leftActionLabel: {
      color: colors.background,
      fontWeight: '600',
      fontSize: 12,
      marginTop: 4,
    },
    swipeableContainer: {
      marginVertical: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBox: {
      width: '80%',
      borderRadius: 12,
      padding: 20,
      maxHeight: '60%',
      backgroundColor: colors.surface,
    },
    modalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cancelItem: {
      borderBottomWidth: 0,
      marginTop: 8,
    },
    modalText: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    mediaPreviewContainer: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      maxHeight: 100,
    },
    mediaPreviewItem: {
      marginRight: 8,
      position: 'relative',
    },
    mediaPreviewImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    removeMediaButton: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 12,
      padding: 2,
    },
    addMembersButton: {
      position: 'absolute',
      bottom: 80,
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
    memberCount: {
      fontSize: 12,
      opacity: 0.7,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    senderInfo: {
      marginBottom: 4,
      marginLeft: 8,
    },
    senderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    senderName: {
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 6,
    },
    callButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    callButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
  });
};

// Backward compatibility - default light theme styles
export const styles = createStyles('light');
