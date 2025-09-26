import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useAppTheme } from '../../themes';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAvatar from '../../components/CustomAvatar';
import { createStyles } from './styles';
import {
  getGroupDetails,
  updateGroupName,
  removeUserFromGroup,
  leaveGroup,
  getUserProfile,
  addMembersToGroup,
} from '../../services/firebase/chat';
import FriendSelectionBottomSheet from '../../components/FriendSelectionBottomSheet';

interface GroupMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'member';
  isActive: boolean;
}

interface GroupDetailsData {
  groupName: string;
  participants: string[];
  admins: string[];
  members: Record<string, any>;
  createdBy: string;
}

const GroupDetailsContainer = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { roomId, groupName: initialGroupName } = route.params || {};
  
  const myId = useSelector((s: RootState) => s.auth.user?.uid);
  const { colors, mode } = useAppTheme();
  const styles = createStyles(mode);
  const { t } = useTranslation();

  const [groupDetails, setGroupDetails] = useState<GroupDetailsData | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(initialGroupName || '');
  const [savingName, setSavingName] = useState(false);
  const [addMemberBottomSheetVisible, setAddMemberBottomSheetVisible] = useState(false);

  const isAdmin = groupDetails?.admins?.includes(myId || '') || false;

  const loadGroupDetails = useCallback(async () => {
    if (!roomId) return;
    
    try {
      setLoading(true);
      const details = await getGroupDetails(roomId);
      setGroupDetails(details);
      setNewGroupName(details.groupName || 'Group');

      // Load member profiles
      const memberProfiles = await Promise.all(
        details.participants.map(async (participantId: string) => {
          try {
            const profile = await getUserProfile(participantId);
            const memberData = details.members[participantId] || {};
            const isAdmin = details.admins?.includes(participantId) || false;
            
            // Check if member is active - default to true if not specified
            const isActive = memberData.isActive !== false;
            
            return {
              id: participantId,
              name: profile?.displayName || profile?.name || profile?.email?.split('@')[0] || 'Unknown User',
              email: profile?.email || '',
              avatar: profile?.avatar || profile?.photoURL,
              role: isAdmin ? 'admin' : 'member',
              isActive: isActive,
            };
          } catch (error) {
            console.error(`Error loading member profile for ${participantId}:`, error);
            const isAdmin = details.admins?.includes(participantId) || false;
            const memberData = details.members[participantId] || {};
            const isActive = memberData.isActive !== false;
            
            return {
              id: participantId,
              name: 'Unknown User',
              email: '',
              avatar: undefined,
              role: isAdmin ? 'admin' : 'member',
              isActive: isActive,
            };
          }
        })
      );
      console.log(memberProfiles, "member profiles with isActive status")

      // Only show active members in the UI
      const activeMembers = memberProfiles.filter(member => member.isActive);
      setMembers(activeMembers);
    } catch (error) {
      console.error('Error loading group details:', error);
      Alert.alert('Error', 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  
  useEffect(() => {
    loadGroupDetails();
  }, [loadGroupDetails]);

  const handleSaveGroupName = async () => {
    if (!roomId || !newGroupName.trim()) return;

    try {
      setSavingName(true);
      await updateGroupName(roomId, newGroupName.trim());
      setGroupDetails(prev => prev ? { ...prev, groupName: newGroupName.trim() } : null);
      setEditingName(false);
      Alert.alert('Success', 'Group name updated successfully');
    } catch (error) {
      console.error('Error updating group name:', error);
      Alert.alert('Error', 'Failed to update group name');
    } finally {
      setSavingName(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!roomId || !isAdmin || memberId === myId) return;

    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeUserFromGroup(roomId, memberId, myId || '');
              setMembers(prev => prev.filter(member => member.id !== memberId));
              Alert.alert('Success', `${memberName} has been removed from the group`);
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            }
          },
        },
      ]
    );
  };

  const handleAddNewMembers = async (selectedFriends: any[]) => {
    if (!roomId || !myId || selectedFriends.length === 0) return;
    
    try {
      const memberIds = selectedFriends.map(friend => friend.id);
      await addMembersToGroup(roomId, memberIds, myId);
      
      // Refresh group details to show new members
      await loadGroupDetails();
      
      Alert.alert('Success', `Added ${selectedFriends.length} member(s) to the group`);
      setAddMemberBottomSheetVisible(false);
    } catch (error: any) {
      Alert.alert('Error', `Failed to add members: ${error.message}`);
    }
  };

  const handleLeaveGroup = async () => {
    if (!roomId || !myId) return;

    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group? You will no longer receive messages from this group.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await leaveGroup(roomId, myId);
              navigation.goBack();
              Alert.alert('Success', 'You have left the group');
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave group');
            }
          },
        },
      ]
    );
  };

  const handleMemberPress = (member: GroupMember) => {
    if (member.id === myId) return;

    navigation.navigate('ChatRoom', {
      friendId: member.id,
      friendName: member.name,
      isGroup: false,
    });
  };

  const renderMember = ({ item }: { item: GroupMember }) => (
    <TouchableOpacity
      style={styles.memberCard}
      onPress={() => handleMemberPress(item)}
      disabled={item.id === myId}
    >
      <View style={styles.memberInfo}>
        <CustomAvatar name={item.name} size={48} />
        <View style={styles.memberDetails}>
          <Text style={styles.memberName}>{item.name}</Text>
          {item.role === 'admin' && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminText}>Admin</Text>
            </View>
          )}
        </View>
      </View>
      
      {isAdmin && item.id !== myId && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveMember(item.id, item.name)}
        >
          <Icon name="remove-circle" size={24} color="#ff3b30" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading group details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Avatar */}
        <View style={styles.avatarSection}>
          <CustomAvatar name={groupDetails?.groupName || 'Group'} size={120} />
        </View>

        {/* Group Name */}
        <View style={styles.nameSection}>
          {editingName ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Enter group name"
                placeholderTextColor={colors.textSecondary}
                autoFocus
                maxLength={50}
              />
              <View style={styles.nameActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditingName(false);
                    setNewGroupName(groupDetails?.groupName || '');
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveGroupName}
                  disabled={savingName || !newGroupName.trim()}
                >
                  {savingName ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.nameDisplay}>
              <Text style={styles.groupName}>{groupDetails?.groupName || 'Group'}</Text>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setEditingName(true)}
                >
                  <Icon name="pencil" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Member Count */}
        {/* Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>{members.length} {members.length === 1 ? 'member' : 'members'}</Text>
          <FlatList
            data={members}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Add New Member Button - Only visible for admins */}
        {isAdmin && (
          <View style={styles.addMemberSection}>
            <TouchableOpacity 
              style={styles.addMemberButton} 
              onPress={() => setAddMemberBottomSheetVisible(true)}
            >
              <Icon name="person-add" size={24} color={colors.primary} />
              <Text style={styles.addMemberText}>Add New Member</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Leave Group Button */}
        <View style={styles.leaveSection}>
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
            <Icon name="exit-outline" size={24} color="#ff3b30" />
            <Text style={styles.leaveText}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Friend Selection Bottom Sheet for Adding Members */}
      <FriendSelectionBottomSheet
        visible={addMemberBottomSheetVisible}
        onClose={() => setAddMemberBottomSheetVisible(false)}
        onSelectFriends={handleAddNewMembers}
        mode="addMembers"
        excludeUserIds={groupDetails?.participants || []}
        title="Add New Members"
      />
    </View>
  );
};

export default GroupDetailsContainer;
