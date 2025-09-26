import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAvatar from '../CustomAvatar';
import { getFriendsList, forwardMessage, Message } from '../../services/firebase/chat';
// Cloudinary upload removed for local-forward flow

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface FriendSelectionBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  messageToForward?: Message | null;
  forwarded?: boolean;
  mediaToForward?: Array<{uri: string; type: string; fileName?: string}>;
  onForwardComplete?: (selectedFriends: Friend[]) => void;
  mode?: 'forward' | 'addMembers';
  excludeUserIds?: string[];
  title?: string;
  onSelectFriends?: (selectedFriends: Friend[]) => void;
}

const FriendSelectionBottomSheet: React.FC<FriendSelectionBottomSheetProps> = ({
  visible,
  onClose,
  messageToForward = null,
  forwarded = false,
  mediaToForward = [],
  onForwardComplete,
  mode = 'forward',
  excludeUserIds = [],
  title,
  onSelectFriends,
}) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<Array<{ uri: string; type: string; fileName?: string }>>([]);

  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  // Load friends list
  const loadFriends = useCallback(async () => {
    if (!myId || !visible) return;

    setLoading(true);
    try {
      const friendsList = await getFriendsList(myId);
      console.log('check it correct', friendsList);
      
      // Filter out users already in group if mode is addMembers
      const filteredFriends = mode === 'addMembers' 
        ? friendsList.filter(friend => !excludeUserIds.includes(friend.id))
        : friendsList;
      
      setFriends(filteredFriends);
    } catch (error: any) {
      Alert.alert('Error', `Failed to load friends: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [myId, visible, mode, excludeUserIds]);

  useEffect(() => {
    if (visible) {
      loadFriends();
      setSelectedFriends(new Set());
    }
  }, [visible, loadFriends]);

  // Toggle friend selection
  const toggleFriendSelection = useCallback((friendId: string) => {
    setSelectedFriends((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(friendId)) {
        newSet.delete(friendId);
      } else {
        newSet.add(friendId);
      }
      return newSet;
    });
  }, []);

  const handleForward = useCallback(async () => {
    if (!myId || selectedFriends.size === 0) return;
  
    setForwarding(true);
  
    try {
      const friendIds = Array.from(selectedFriends);
      const selectedFriendsList = friends.filter((f) => selectedFriends.has(f.id));
  
      if (forwarded && messageToForward) {
        // Forward existing message
        let message: Message = {
          ...messageToForward,
          createdAt: Date.now(),
          senderId: myId,
          status: 'sending',
          isSeen: false,
          seenBy: { [myId]: true },
        };
        
        await forwardMessage(message, friendIds, myId, true);
      } else if (mediaToForward.length > 0) {
        // Forward media files
        let message: Message = {
          text: '',
          senderId: myId,
          receiverId: friendIds[0],
          createdAt: Date.now(),
          messageType:
            mediaToForward.length > 1
              ? 'mixed'
              : mediaToForward[0].type.includes('image')
              ? 'image'
              : 'file',
          media: mediaToForward.map((file) => ({ uri: file.uri, type: file.type })),
          isSeen: false,
          seenBy: { [myId]: true },
          status: 'sending',
        };
        
        await forwardMessage(message, friendIds, myId, false);
      } else if (mode === 'addMembers') {
        // Adding members to group - use onSelectFriends callback
        onSelectFriends?.(selectedFriendsList);
        onClose();
        return;
      } else if (!forwarded) {
        // Adding members to group - just return selected friends
        onForwardComplete?.(selectedFriendsList);
        onClose();
        return;
      } else {
        return; // Nothing to forward
      }
  
      onForwardComplete?.(selectedFriendsList);
      onClose();
    } catch (error: any) {
      console.error('Error forwarding message/media:', error);
      Alert.alert('Error', 'Failed to forward message or media');
    } finally {
      setForwarding(false);
    }
  }, [messageToForward, mediaToForward, myId, selectedFriends, friends, forwarded, onForwardComplete, onClose]);
  
  // Render friend item
  const renderFriendItem = useCallback(
    ({ item }: { item: Friend }) => {
      const isSelected = selectedFriends.has(item.id);

      return (
        <TouchableOpacity
          style={[
            styles.friendItem,
            {
              backgroundColor: colors.card,
              borderColor: isSelected ? colors.primary : colors.text + '20',
            },
          ]}
          onPress={() => toggleFriendSelection(item.id)}
          activeOpacity={0.7}
        >
          <CustomAvatar name={item.name} size={50} />
          <View style={styles.friendInfo}>
            <Text style={[styles.friendName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.friendEmail, { color: colors.text + '80' }]} numberOfLines={1}>
              {item.email}
            </Text>
          </View>
          <View
            style={[
              styles.selectionIndicator,
              {
                backgroundColor: isSelected ? colors.primary : 'transparent',
                borderColor: isSelected ? colors.primary : colors.text + '40',
              },
            ]}
          >
            {isSelected && <Icon name="checkmark" size={16} color="#fff" />}
          </View>
        </TouchableOpacity>
      );
    },
    [selectedFriends, colors, toggleFriendSelection]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.bottomSheet, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.text + '20' }]}>
            <Text style={[styles.title, { color: colors.text }]}>
              {title || (mode === 'addMembers' ? 'Add Members' : (forwarded ? 'Forward Message' : 'Add Members'))}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Message Preview */}
          {messageToForward && (
            <View style={[styles.messagePreview, { backgroundColor: colors.card }]}>
              <Icon name="arrow-redo" size={16} color={colors.primary} />
              <Text style={[styles.previewText, { color: colors.text }]} numberOfLines={2}>
                {messageToForward.text || 
                 (messageToForward.messageType === 'image' ? '📷 Image' :
                  messageToForward.messageType === 'video' ? '🎥 Video' : 
                  '📄 Media')}
              </Text>
            </View>
          )}

          {/* Friends List */}
          <View style={styles.content}>
            <Text style={[styles.subtitle, { color: colors.text }]}>
              Select Friends ({selectedFriends.size} selected)
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  Loading friends...
                </Text>
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="people-outline" size={48} color={colors.text + '40'} />
                <Text style={[styles.emptyText, { color: colors.text }]}>
                  No friends found
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.text + '60' }]}>
                  Add some friends to start forwarding messages
                </Text>
              </View>
            ) : (
              <FlatList
                data={friends}
                keyExtractor={(item) => item.id}
                renderItem={renderFriendItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: colors.text + '20' }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.text + '40' }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.forwardButton,
                { 
                  backgroundColor: selectedFriends.size > 0 ? colors.primary : colors.text + '20'
                }
              ]}
              onPress={handleForward}
              disabled={selectedFriends.size === 0 || forwarding}
            >
              {forwarding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name={forwarded ? "arrow-redo" : "person-add"} size={16} color="#fff" />
                  <Text style={styles.forwardButtonText}>
                    {forwarded ? `Forward (${selectedFriends.size})` : `Add (${selectedFriends.size})`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    height: '90%',
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 8,
  },
  previewText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
  },
  friendEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  forwardButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  forwardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FriendSelectionBottomSheet;
