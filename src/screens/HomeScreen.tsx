import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, ListRenderItem, TouchableOpacity, ScrollView } from 'react-native';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useStreamClient } from '../contexts/StreamProvider';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { StreamTestComponent } from '../components/StreamTestComponent';

// Define your navigation params
type RootStackParamList = {
  OutgoingVideo: { callId: string; targetUserId: string };
  OutgoingAudio: { callId: string; targetUserId: string };
};

// Define User type
interface User {
  id: string;
  name: string;
  [key: string]: any; // In case Firestore has extra fields
}

const HomeScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId] = useState<string>('your-current-user-id'); // From auth
  const [currentUserName] = useState<string>('Your Name');
  const [showTestComponent, setShowTestComponent] = useState<boolean>(false);
  const { connectUser } = useStreamClient();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    connectUser(currentUserId, currentUserName); // Connect on load
    const subscriber = firestore()
      .collection<User>('users')
      .onSnapshot((querySnapshot: FirebaseFirestoreTypes.QuerySnapshot<User>) => {
        const userList: User[] = [];
        querySnapshot.forEach(doc => {
          if (doc.id !== currentUserId) userList.push({ id: doc.id, ...doc.data() });
        });
        setUsers(userList);
      });

    return () => subscriber();
  }, [connectUser, currentUserId, currentUserName]);

  const startCall = (targetUserId: string, isVideo: boolean) => {
    const callId = `${currentUserId}_${targetUserId}_${Date.now()}`; // Unique ID
    if (isVideo) {
      navigation.navigate('OutgoingVideo', { callId, targetUserId });
    } else {
      navigation.navigate('OutgoingAudio', { callId, targetUserId });
    }
  };

  const renderUser: ListRenderItem<User> = ({ item }) => (
    <View style={styles.userRow}>
      <Text>{item.name}</Text>
      <View style={styles.buttons}>
        <Button title="Video Call" onPress={() => startCall(item.id, true)} />
        <Button title="Audio Call" onPress={() => startCall(item.id, false)} />
      </View>
    </View>
  );

  if (showTestComponent) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowTestComponent(false)}
        >
          <Text style={styles.backButtonText}>← Back to Users</Text>
        </TouchableOpacity>
        <StreamTestComponent />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select User to Call</Text>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => setShowTestComponent(true)}
        >
          <Text style={styles.testButtonText}>Test Stream Setup</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, flex: 1 },
  testButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  userRow: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1 
  },
  buttons: { flexDirection: 'row', gap: 10 },
});

export default HomeScreen;
