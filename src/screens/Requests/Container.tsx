// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const RequestsContainer = () => {
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Requests</Text>
//       <Text>Incoming and Connected users will appear here.</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: '#fff' }, title: { fontWeight: '700', fontSize: 18, marginBottom: 8 } });

// export default RequestsContainer;

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { getRequests, acceptRequest, declineRequest } from './requestService';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

type RequestItem = { fromUserId: string; fromName: string; status: string };
type FriendItem = { friendId: string; friendName: string };

const RequestsContainer = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const userId = auth().currentUser?.uid;

  useEffect(() => {
    if (!userId) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch requests
        const requestsData = await getRequests(userId);
        const requestList = await Promise.all(
          Object.keys(requestsData).map(async fromUserId => {
            const userDoc = await firestore()
              .collection('users')
              .doc(fromUserId)
              .get();
            return {
              fromUserId,
              fromName: userDoc.data()?.name || requestsData[fromUserId].from,
              status: requestsData[fromUserId].status,
            };
          }),
        );
        setRequests(requestList);

        // Fetch friends
        const friendsDoc = await firestore()
          .collection('friends')
          .doc(userId)
          .get();
        const friendsData = friendsDoc.data() || {};
        const friendList = await Promise.all(
          Object.keys(friendsData).map(async friendId => {
            const userDoc = await firestore()
              .collection('users')
              .doc(friendId)
              .get();
            return {
              friendId,
              friendName: userDoc.data()?.name || friendId,
            };
          }),
        );
        setFriends(friendList);
      } catch (err: any) {
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleAccept = async (fromUserId: string) => {
    try {
      await acceptRequest(userId!, fromUserId);
      setRequests(prev => prev.filter(req => req.fromUserId !== fromUserId));
      const userDoc = await firestore()
        .collection('users')
        .doc(fromUserId)
        .get();
      setFriends(prev => [
        ...prev,
        {
          friendId: fromUserId,
          friendName: userDoc.data()?.name || fromUserId,
        },
      ]);
      Alert.alert('Success', 'Friend request accepted');
    } catch (err: any) {
      Alert.alert('Error', `Failed to accept request: ${err.message}`);
    }
  };

  const handleDecline = async (fromUserId: string) => {
    try {
      await declineRequest(userId!, fromUserId);
      setRequests(prev => prev.filter(req => req.fromUserId !== fromUserId));
      Alert.alert('Success', 'Friend request declined');
    } catch (err: any) {
      Alert.alert('Error', `Failed to decline request: ${err.message}`);
    }
  };

  // Suggested UI for sending a friend request
  const handleSearch = async () => {
    if (!searchQuery) return;
    try {
      const userSnapshot = await firestore()
        .collection('users')
        .where('email', '==', searchQuery)
        .get();
      if (userSnapshot.empty) {
        Alert.alert('Error', 'No user found with this email');
        return;
      }
      const user = userSnapshot.docs[0];
      const toUserId = user.id;
      if (toUserId === userId) {
        Alert.alert('Error', 'Cannot send request to yourself');
        return;
      }
      Alert.alert(
        'Send Friend Request',
        `Send a friend request to ${user.data().name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send',
            onPress: () => {
              // Call sendRequest(userId!, toUserId) here if implemented
              Alert.alert(
                'Info',
                'Friend request would be sent to ' + user.data().name,
              );
            },
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Error', `Failed to search user: ${err.message}`);
    }
  };

  const renderRequestItem = ({ item }: { item: RequestItem }) => (
    <View style={styles.requestItem}>
      <Text style={styles.requestText}>{item.fromName} (Pending)</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleAccept(item.fromUserId)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={() => handleDecline(item.fromUserId)}
        >
          <Text style={styles.buttonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendItem = ({ item }: { item: FriendItem }) => (
    <View style={styles.friendItem}>
      <Text style={styles.friendText}>Friend: {item.friendName}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchData()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friend Requests</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter email to send friend request"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
      {requests.length === 0 ? (
        <Text style={styles.emptyText}>No incoming requests</Text>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.fromUserId}
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>Incoming Requests</Text>
          }
        />
      )}
      <Text style={styles.title}>Connected Friends</Text>
      {friends.length === 0 ? (
        <Text style={styles.emptyText}>No connected friends</Text>
      ) : (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.friendId}
          ListHeaderComponent={
            <Text style={styles.sectionHeader}>Friends</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 12,
    color: '#333',
  },
  sectionHeader: {
    fontWeight: '600',
    fontSize: 16,
    marginVertical: 8,
    color: '#555',
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#28a745',
  },
  declineButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  friendItem: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  friendText: {
    fontSize: 16,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 6,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default RequestsContainer;
