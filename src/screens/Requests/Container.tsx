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

import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../themes/useTheme';
import { createStyles } from './styles';

// Custom Tab Component



const RequestedContainer = () => {
  const [requests, setRequests] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const { t } = useTranslation();
  const { colors } = useAppTheme(); // Correctly destructure colors
  const styles = createStyles(colors);

  useEffect(() => {
    fetchData();
  }, []);

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
            <Text style={styles.btnText}>{t('requests.accept')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleDecline(item.id)}
          >
            <Text style={styles.btnText}>{t('requests.decline')}</Text>
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
        <Text style={styles.btnText}>{t('requests.sendRequest')}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <Text style={styles.loading}>{t('common.loading')}</Text>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.tabContainer}>
        <TabButton
          title={t('requests.friendRequests')}
          isActive={activeTab === 'requests'}
          onPress={() => setActiveTab('requests')}
        />
        <TabButton
          title={t('requests.suggested')}
          isActive={activeTab === 'suggested'}
          onPress={() => setActiveTab('suggested')}
        />
      </View>
      {activeTab === 'requests' ? (
        <View style={styles.content}>
          <Text style={styles.heading}>{t('requests.friendRequests')}</Text>
          {requests.length > 0 ? (
            <FlatList
              data={requests}
              keyExtractor={item => item.id}
              renderItem={renderRequestItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noData}>{t('requests.noRequests')}</Text>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={styles.heading}>{t('requests.suggestedUsers')}</Text>
          {suggestedUsers.length > 0 ? (
            <FlatList
              data={suggestedUsers}
              keyExtractor={item => item.id}
              renderItem={renderSuggestedItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noData}>{t('requests.noSuggestedUsers')}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default RequestedContainer;
