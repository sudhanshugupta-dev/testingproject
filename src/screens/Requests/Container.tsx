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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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

  const renderRequestItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.text}>{item.name}</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleAccept(item.id)}
          >
            <Text style={styles.btnText}>{t('common.accept', { defaultValue: 'Accept' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleDecline(item.id)}
          >
            <Text style={styles.btnText}>{t('common.decline', { defaultValue: 'Decline' })}</Text>
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
        <Text style={styles.btnText}>{t('common.sendRequest', { defaultValue: 'Send Request' })}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <Text style={styles.loading}>Loading...</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TabButton
          title={t('tabs.requests')}
          isActive={activeTab === 'requests'}
          onPress={() => setActiveTab('requests')}
        />
        <TabButton
          title={t('requests.suggested', { defaultValue: 'Suggested' })}
          isActive={activeTab === 'suggested'}
          onPress={() => setActiveTab('suggested')}
        />
      </View>
      {activeTab === 'requests' ? (
        <View style={styles.content}>
          <Text style={styles.heading}>{t('requests.title', { defaultValue: 'Friend Requests' })}</Text>
          {requests.length > 0 ? (
            <FlatList
              data={requests}
              keyExtractor={item => item.id}
              renderItem={renderRequestItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noData}>{t('requests.none', { defaultValue: 'No friend requests' })}</Text>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.heading}>{t('requests.suggested', { defaultValue: 'Suggested Users' })}</Text>
          {suggestedUsers.length > 0 ? (
            <FlatList
              data={suggestedUsers}
              keyExtractor={item => item.id}
              renderItem={renderSuggestedItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noData}>{t('requests.noneSuggested', { defaultValue: 'No suggested users' })}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default RequestedContainer;
