import database from '@react-native-firebase/database';
import { getFirebaseApp } from './index';
getFirebaseApp();

export const getRequests = async (userId: string) => {
  const snap = await database().ref(`/requests/${userId}`).once('value');
  return snap.val() || {};
};

export const sendRequest = async (fromUserId: string, toUserId: string) => {
  await database().ref(`/requests/${toUserId}/${fromUserId}`).set({ from: fromUserId, status: 'pending' });
};

export const acceptRequest = async (userId: string, fromUserId: string) => {
  await database().ref(`/friends/${userId}/${fromUserId}`).set(true);
  await database().ref(`/friends/${fromUserId}/${userId}`).set(true);
  await database().ref(`/requests/${userId}/${fromUserId}`).remove();
};

export const declineRequest = async (userId: string, fromUserId: string) => {
  await database().ref(`/requests/${userId}/${fromUserId}`).remove();
};
