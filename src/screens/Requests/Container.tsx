// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import {
//   getFriendRequests,
//   getSuggestedUsers,
//   sendFriendRequest,
//   acceptFriendRequest,
//   declineFriendRequest,
// } from '../../services/firebase/requests'; // <- your API file

// const requestedContainer = () => {
//   const [requests, setRequests] = useState<string[]>([]);
//   const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);

//     try {
//       // 1️⃣ Get incoming requests
//       const req = await getFriendRequests();
//       setRequests(req);

//       // 2️⃣ If no requests → load suggested users
//       if (req.length === 0) {
//         const suggestions = await getSuggestedUsers();
//         setSuggestedUsers(suggestions);
//         console.log(suggestedUsers);
//       }
//     } catch (error) {
//       console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAccept = async (fromUserId: string) => {
//     await acceptFriendRequest(fromUserId);
//     fetchData();
//   };

//   const handleDecline = async (fromUserId: string) => {
//     await declineFriendRequest(fromUserId);
//     fetchData();
//   };

//   const handleSendRequest = async (toUserId: string) => {
//     await sendFriendRequest(toUserId);
//     fetchData();
//   };

//   const renderRequestItem = ({ item }: { item: string }) => (
//     <View style={styles.card}>
//       <Text style={styles.text}>Friend Request from: {item}</Text>
//       <View style={styles.row}>
//         <TouchableOpacity
//           style={styles.acceptBtn}
//           onPress={() => handleAccept(item)}
//         >
//           <Text style={styles.btnText}>Accept</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.declineBtn}
//           onPress={() => handleDecline(item)}
//         >
//           <Text style={styles.btnText}>Decline</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const renderSuggestedItem = ({ item }: { item: any }) => (
//     <View style={styles.card}>
//       <Text style={styles.text}>{item.name}</Text>
//       <Text style={styles.subText}>{item.email}</Text>
//       <TouchableOpacity
//         style={styles.requestBtn}
//         onPress={() => handleSendRequest(item.id)}
//       >
//         <Text style={styles.btnText}>Send Request</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading) return <Text style={styles.loading}>Loading...</Text>;

//   return (
//     <View style={styles.container}>
//       {requests.length > 0 ? (
//         <>
//           <Text style={styles.heading}>Friend Requests</Text>
//           <FlatList
//             data={requests}
//             keyExtractor={item => item}
//             renderItem={renderRequestItem}
//           />
//         </>
//       ) : (
//         <>
//           <Text style={styles.heading}>Suggested Users</Text>
//           <FlatList
//             data={suggestedUsers}
//             keyExtractor={item => item.id}
//             renderItem={renderSuggestedItem}
//           />
//         </>
//       )}
//     </View>
//   );
// };

// export default requestedContainer;

// const styles = StyleSheet.create({
//   container: { flex: 1, padding: 16, backgroundColor: '#fff' },
//   heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
//   card: {
//     padding: 12,
//     marginVertical: 6,
//     borderWidth: 1,
//     borderRadius: 10,
//     borderColor: '#ddd',
//   },
//   text: { fontSize: 16, fontWeight: '600' },
//   subText: { fontSize: 14, color: '#666' },
//   row: { flexDirection: 'row', marginTop: 8 },
//   acceptBtn: {
//     backgroundColor: 'green',
//     padding: 8,
//     borderRadius: 6,
//     marginRight: 8,
//   },
//   declineBtn: { backgroundColor: 'red', padding: 8, borderRadius: 6 },
//   requestBtn: {
//     backgroundColor: 'blue',
//     padding: 8,
//     borderRadius: 6,
//     marginTop: 6,
//   },
//   btnText: { color: '#fff', fontWeight: 'bold' },
//   loading: { flex: 1, textAlign: 'center', marginTop: 50, fontSize: 18 },
// });

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  getFriendRequests,
  getSuggestedUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from '../../services/firebase/requests';
import {styles} from './styles';

// Custom Tab Component
const TabButton = ({ title, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.tabText,
        isActive ? styles.activeTabText : styles.inactiveTabText,
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const RequestedContainer = () => {
  const [requests, setRequests] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const req = await getFriendRequests();
      setRequests(req);
      const suggestions = await getSuggestedUsers();
      setSuggestedUsers(suggestions);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async fromUserId => {
    await acceptFriendRequest(fromUserId);
    fetchData();
  };

  const handleDecline = async fromUserId => {
    await declineFriendRequest(fromUserId);
    fetchData();
  };

  const handleSendRequest = async toUserId => {
    await sendFriendRequest(toUserId);
    fetchData();
  };

  console.log('requested', requests);
  const renderRequestItem = ({ item }) => {
    console.log('AS', item);
    return (
      <View style={styles.card}>
        <Text style={styles.text}>{item.name}</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAccept(item.id)}
          >
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleDecline(item.id)}
          >
            <Text style={styles.btnText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSuggestedItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.text}>{item.name}</Text>
      <Text style={styles.subText}>{item.email}</Text>
      <TouchableOpacity
        style={styles.requestBtn}
        onPress={() => handleSendRequest(item.id)}
      >
        <Text style={styles.btnText}>Send Request</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TabButton
          title="Requests"
          isActive={activeTab === 'requests'}
          onPress={() => setActiveTab('requests')}
        />
        <TabButton
          title="Suggested"
          isActive={activeTab === 'suggested'}
          onPress={() => setActiveTab('suggested')}
        />
      </View>
      {activeTab === 'requests' ? (
        <View style={styles.content}>
          <Text style={styles.heading}>Friend Requests</Text>
          {requests.length > 0 ? (
            <FlatList
              data={requests}
              keyExtractor={item => item}
              renderItem={renderRequestItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noData}>No friend requests</Text>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.heading}>Suggested Users</Text>
          {suggestedUsers.length > 0 ? (
            <FlatList
              data={suggestedUsers}
              keyExtractor={item => item.id}
              renderItem={renderSuggestedItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noData}>No suggested users</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default RequestedContainer;
