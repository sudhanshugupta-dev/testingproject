


// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   RefreshControl,
// } from 'react-native';
// import {
//   getFriendRequests,
//   getSuggestedUsers,
//   sendFriendRequest,
//   acceptFriendRequest,
//   declineFriendRequest,
// } from '../../services/firebase/requests';

// import { useTranslation } from 'react-i18next';
// import { useAppTheme } from '../../themes/useTheme';
// import { createStyles } from './styles';

// const RequestedContainer = () => {
//   const [requests, setRequests] = useState<any[]>([]);
//   const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false); // ✅ For pull-to-refresh
//   const [activeTab, setActiveTab] = useState<'requests' | 'suggested'>('requests');
//   const { t } = useTranslation();
//   const { colors } = useAppTheme();
//   const styles = createStyles(colors);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     if (!refreshing) setLoading(true); // ✅ Show loader only for first load
//     try {
//       const req = await getFriendRequests();
//       setRequests(req);
//       const suggestions = await getSuggestedUsers();
//       setSuggestedUsers(suggestions);
//     } catch (error) {
//       console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false); // ✅ stop pull-to-refresh loader
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchData();
//   };

//   const TabButton = ({ title, isActive, onPress }) => (
//     <TouchableOpacity
//       style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
//       onPress={onPress}
//     >
//       <Text
//         style={[
//           styles.tabText,
//           isActive ? styles.activeTabText : styles.inactiveTabText,
//         ]}
//       >
//         {title}
//       </Text>
//     </TouchableOpacity>
//   );

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

//   const renderRequestItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.text}>{item.name}</Text>
//       <View style={styles.row}>
//         <TouchableOpacity
//           style={styles.acceptBtn}
//           onPress={() => handleAccept(item.id)}
//         >
//           <Text style={styles.btnText}>{t('requests.accept')}</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={styles.declineBtn}
//           onPress={() => handleDecline(item.id)}
//         >
//           <Text style={styles.btnText}>{t('requests.decline')}</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );

//   const renderSuggestedItem = ({ item }) => (
//     <View style={styles.card}>
//       <Text style={styles.text}>{item.name}</Text>
//       <Text style={styles.subText}>{item.email}</Text>
//       <TouchableOpacity
//         style={styles.requestBtn}
//         onPress={() => handleSendRequest(item.id)}
//       >
//         <Text style={styles.btnText}>{t('requests.sendRequest')}</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   if (loading) return <Text style={styles.loading}>{t('common.loading')}</Text>;

//   return (
//     <View style={[styles.container, { backgroundColor: colors.background }]}>
//       {/* Tabs */}
//       <View style={styles.tabContainer}>
//         <TabButton
//           title={t('requests.friendRequests')}
//           isActive={activeTab === 'requests'}
//           onPress={() => setActiveTab('requests')}
//         />
//         <TabButton
//           title={t('requests.suggested')}
//           isActive={activeTab === 'suggested'}
//           onPress={() => setActiveTab('suggested')}
//         />
//       </View>

//       {/* Requests Tab */}
//       {activeTab === 'requests' ? (
//         <View style={styles.content}>
//           <Text style={styles.heading}>{t('requests.friendRequests')}</Text>
//           {requests.length > 0 ? (
//             <FlatList
//               data={requests}
//               keyExtractor={item => item.id}
//               renderItem={renderRequestItem}
//               showsVerticalScrollIndicator={false}
//               refreshControl={
//                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//               }
//             />
//           ) : (
//             <Text style={styles.noData}>{t('requests.noRequests')}</Text>
//           )}
//         </View>
//       ) : (
//         /* Suggested Users Tab */
//         <View style={styles.content}>
//           <Text style={styles.heading}>{t('requests.suggestedUsers')}</Text>
//           {suggestedUsers.length > 0 ? (
//             <FlatList
//               data={suggestedUsers}
//               keyExtractor={item => item.id}
//               renderItem={renderSuggestedItem}
//               showsVerticalScrollIndicator={false}
//               refreshControl={
//                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//               }
//             />
//           ) : (
//             <Text style={styles.noData}>{t('requests.noSuggestedUsers')}</Text>
//           )}
//         </View>
//       )}
//     </View>
//   );
// };

// export default RequestedContainer;




// RequestedContainer.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  getFriendRequests,
  getSuggestedUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from '../../services/firebase/requests';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../themes/useTheme';
import { createStyles } from './styles';

const RequestedContainer: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const tabBarHeight = useBottomTabBarHeight();

  const [requests, setRequests] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'suggested'>('requests');

  const fetchData = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const [reqs, suggestions] = await Promise.all([getFriendRequests(), getSuggestedUsers()]);
      setRequests(reqs || []);
      setSuggestedUsers(suggestions || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleAccept = async (fromUserId: string) => {
    await acceptFriendRequest(fromUserId);
    fetchData();
  };

  const handleDecline = async (fromUserId: string) => {
    await declineFriendRequest(fromUserId);
    fetchData();
  };

  const handleSendRequest = async (toUserId: string) => {
    await sendFriendRequest(toUserId);
    fetchData();
  };

  const renderRequestItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.text}>{item.name}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(item.id)}>
          <Text style={styles.btnText}>{t('requests.accept')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.declineBtn} onPress={() => handleDecline(item.id)}>
          <Text style={styles.btnText}>{t('requests.decline')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSuggestedItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <Text style={styles.text}>{item.name}</Text>
      <Text style={styles.subText}>{item.email}</Text>
      <TouchableOpacity style={styles.requestBtn} onPress={() => handleSendRequest(item.id)}>
        <Text style={styles.btnText}>{t('requests.sendRequest')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loading, { marginTop: 12 }]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // shared list props to ensure the list fills available space and has tab-safe bottom padding
  const listCommonProps = {
    style: { flex: 1 },
    contentContainerStyle: { paddingBottom: tabBarHeight + 24, flexGrow: 1, paddingHorizontal: 0 },
    refreshing,
    onRefresh,
    keyboardShouldPersistTaps: 'handled' as const,
    showsVerticalScrollIndicator: false,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background, flex: 1 }]}>
      {/* tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' ? styles.activeTabText : styles.inactiveTabText]}>
            {t('requests.friendRequests')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'suggested' ? styles.activeTab : styles.inactiveTab]}
          onPress={() => setActiveTab('suggested')}
        >
          <Text style={[styles.tabText, activeTab === 'suggested' ? styles.activeTabText : styles.inactiveTabText]}>
            {t('requests.suggested')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Requests list */}
      {activeTab === 'requests' ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderRequestItem}
          ListHeaderComponent={<Text style={styles.heading}>{t('requests.friendRequests')}</Text>}
          ListEmptyComponent={<Text style={styles.noData}>{t('requests.noRequests')}</Text>}
          {...listCommonProps}
        />
      ) : (
        /* Suggested Users list */
        <FlatList
          data={suggestedUsers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderSuggestedItem}
          ListHeaderComponent={<Text style={styles.heading}>{t('requests.suggestedUsers')}</Text>}
          ListEmptyComponent={<Text style={styles.noData}>{t('requests.noSuggestedUsers')}</Text>}
          {...listCommonProps}
        />
      )}
    </SafeAreaView>
  );
};

export default RequestedContainer;
