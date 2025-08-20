import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export const getRequests = async (userId: string): Promise<any> => {
  try {
    const currentUserId = auth().currentUser?.uid;
    if (!currentUserId || currentUserId !== userId)
      throw new Error('User not authenticated or ID mismatch');

    console.log('Fetching friend requests for user:', userId);
    const doc = await firestore().collection('requests').doc(userId).get();
    const requests = doc.data() || {};
    console.log('Friend requests fetched:', requests);
    return requests;
  } catch (error: any) {
    console.error('Error fetching friend requests:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to fetch friend requests: ${error.message} (Code: ${error.code})`,
    );
  }
};

export const acceptRequest = async (
  userId: string,
  fromUserId: string,
): Promise<void> => {
  try {
    const currentUserId = auth().currentUser?.uid;
    if (!currentUserId || currentUserId !== userId)
      throw new Error('User not authenticated or ID mismatch');

    console.log(
      'Accepting friend request for user:',
      userId,
      'from:',
      fromUserId,
    );
    await Promise.all([
      firestore()
        .collection('friends')
        .doc(userId)
        .set({ [fromUserId]: true }, { merge: true }),
      firestore()
        .collection('friends')
        .doc(fromUserId)
        .set({ [userId]: true }, { merge: true }),
      firestore()
        .collection('requests')
        .doc(userId)
        .update({ [fromUserId]: firestore.FieldValue.delete() }),
    ]);
    console.log('Friend request accepted successfully');
  } catch (error: any) {
    console.error('Error accepting friend request:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to accept friend request: ${error.message} (Code: ${error.code})`,
    );
  }
};

export const declineRequest = async (
  userId: string,
  fromUserId: string,
): Promise<void> => {
  try {
    const currentUserId = auth().currentUser?.uid;
    if (!currentUserId || currentUserId !== userId)
      throw new Error('User not authenticated or ID mismatch');

    console.log(
      'Declining friend request for user:',
      userId,
      'from:',
      fromUserId,
    );
    await firestore()
      .collection('requests')
      .doc(userId)
      .update({ [fromUserId]: firestore.FieldValue.delete() });
    console.log('Friend request declined successfully');
  } catch (error: any) {
    console.error('Error declining friend request:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to decline friend request: ${error.message} (Code: ${error.code})`,
    );
  }
};

// Suggested sendRequest function (not implemented, as per your preference)
export const sendRequest = async (
  fromUserId: string,
  toUserId: string,
): Promise<void> => {
  try {
    const currentUserId = auth().currentUser?.uid;
    if (!currentUserId || currentUserId !== fromUserId)
      throw new Error('User not authenticated or ID mismatch');

    console.log('Sending friend request from:', fromUserId, 'to:', toUserId);
    await firestore()
      .collection('requests')
      .doc(toUserId)
      .set(
        { [fromUserId]: { from: fromUserId, status: 'pending' } },
        { merge: true },
      );
    console.log('Friend request sent successfully');
  } catch (error: any) {
    console.error('Error sending friend request:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to send friend request: ${error.message} (Code: ${error.code})`,
    );
  }
};
