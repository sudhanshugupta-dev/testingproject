import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// ✅ Helper to get current userId
const getCurrentUserId = (): string => {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return uid;
};

/** --------------------------
 *  SEND FRIEND REQUEST
 * --------------------------- */
export const sendFriendRequest = async (toUserId: string): Promise<void> => {
  const fromUserId = getCurrentUserId();

  // Validate inputs
  if (!fromUserId || !toUserId) {
    throw new Error('User IDs are required');
  }
  if (fromUserId === toUserId) {
    throw new Error("Can't send request to yourself");
  }

  const db = firestore();
  const fromUserRef = db.collection('friendRequests').doc(fromUserId);
  const toUserRef = db.collection('friendRequests').doc(toUserId);
  const userCheckRef = db.collection('users').doc(toUserId);

  try {
    // Check if recipient exists in the users collection
    const userDoc = await userCheckRef.get();
    if (!userDoc.exists) {
      throw new Error('Recipient user does not exist');
    }

    // Check if a friend request already exists
    const fromUserDoc = await fromUserRef.get();
    const toUserDoc = await toUserRef.get();

    const fromUserData = fromUserDoc.data() as FriendRequestDoc | undefined;
    const toUserData = toUserDoc.data() as FriendRequestDoc | undefined;

    if (
      (fromUserData?.sent && fromUserData.sent[toUserId]) ||
      (toUserData?.received && toUserData.received[fromUserId])
    ) {
      throw new Error('A friend request already exists');
    }

    // Use a batch to ensure atomic updates
    const batch = db.batch();

    // Update or create sender's document
    batch.set(
      fromUserRef,
      {
        sent: { [toUserId]: 'pending' },
      },
      { merge: true },
    );

    // Update or create recipient's document
    batch.set(
      toUserRef,
      {
        received: { [fromUserId]: 'pending' },
      },
      { merge: true },
    );

    // Commit the batch
    await batch.commit();
    console.log(`Friend request sent from ${fromUserId} to ${toUserId}`);
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    throw new Error(`Failed to send friend request: ${error.message}`);
  }
};
/** --------------------------
 *  ACCEPT FRIEND REQUEST
 * --------------------------- */
export const acceptFriendRequest = async (fromUserId: string) => {
  const currentUserId = getCurrentUserId();

  try {
    const batch = firestore().batch();

    // Update friend requests
    const currentUserRef = firestore()
      .collection('friendRequests')
      .doc(currentUserId);
    const fromUserRef = firestore()
      .collection('friendRequests')
      .doc(fromUserId);

    batch.update(currentUserRef, { [`received.${fromUserId}`]: 'accepted' });
    batch.update(fromUserRef, { [`sent.${currentUserId}`]: 'accepted' });

    // Add to friends (as both map and array for compatibility)
    const currentFriendsRef = firestore()
      .collection('friends')
      .doc(currentUserId);
    const fromFriendsRef = firestore().collection('friends').doc(fromUserId);

    batch.set(currentFriendsRef, { [fromUserId]: true }, { merge: true });
    batch.set(fromFriendsRef, { [currentUserId]: true }, { merge: true });

    batch.set(currentFriendsRef, { friendIds: firestore.FieldValue.arrayUnion(fromUserId) }, { merge: true });
    batch.set(fromFriendsRef, { friendIds: firestore.FieldValue.arrayUnion(currentUserId) }, { merge: true });

    // Commit the batch
    await batch.commit();

    // Fetch the profile details of the accepted user
    const userDoc = await firestore().collection('users').doc(fromUserId).get();

    if (!userDoc.exists) {
      throw new Error('User profile not found');
    }

    const userData = userDoc.data() as any;
    return {
      id: userDoc.id,
      name: userData.name || 'Unknown',
      email: userData.email || 'No email',
      avatar: userData.avatar || null,
      // Add other relevant fields as needed
    };
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};
/** --------------------------
 *  DECLINE FRIEND REQUEST
 * --------------------------- */
export const declineFriendRequest = async (
  fromUserId: string,
): Promise<void> => {
  const currentUserId = getCurrentUserId();

  const batch = firestore().batch();

  const currentUserRef = firestore()
    .collection('friendRequests')
    .doc(currentUserId);
  const fromUserRef = firestore().collection('friendRequests').doc(fromUserId);

  batch.update(currentUserRef, { [`received.${fromUserId}`]: 'declined' });
  batch.update(fromUserRef, { [`sent.${currentUserId}`]: 'declined' });

  await batch.commit();
};

/** --------------------------
 *  GET ALL FRIEND REQUESTS
 * --------------------------- */

export const getFriendRequests = async () => {
  const userId = getCurrentUserId();

  try {
    // Fetch the friend requests document for the current user
    const doc = await firestore()
      .collection('friendRequests')
      .doc(userId)
      .get();

    // Get pending request user IDs
    const pendingRequestIds = doc.exists
      ? Object.keys(doc.data()?.received || {}).filter(
          uid => (doc.data() as any)?.received[uid] === 'pending',
        )
      : [];

    // Fetch user details for each pending request ID
    const userDetailsPromises = pendingRequestIds.map(async uid => {
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (!userDoc.exists) {
        return null; // Handle case where user document doesn't exist
      }

      const userData = userDoc.data() as any;
      return {
        id: userDoc.id,
        name: userData.name || 'Unknown',
        email: userData.email || 'No email',
        avatar: userData.avatar || null,
        // Add other relevant fields as needed
      };
    });

    // Resolve all user details promises and filter out null results
    const userDetails = (await Promise.all(userDetailsPromises)).filter(
      user => user !== null,
    );

    return userDetails;
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    return [];
  }
};

/** --------------------------
 *  GET ALL FRIENDS
 * --------------------------- */
export const getFriends = async (): Promise<string[]> => {
  const userId = getCurrentUserId();
  const doc = await firestore().collection('friends').doc(userId).get();
  const data = doc.data() || {};
  return Array.isArray((data as any).friendIds) ? (data as any).friendIds : Object.keys(data);
};

export const getSuggestedUsers = async () => {
  const userId = getCurrentUserId();

  try {
    // 1️⃣ Get current friends
    const friendsDoc = await firestore()
      .collection('friends')
      .doc(userId)
      .get();
    const friendsData = friendsDoc.exists ? friendsDoc.data() || {} : {};
    const friends = Array.isArray((friendsData as any).friendIds)
      ? ((friendsData as any).friendIds as string[])
      : Object.keys(friendsData);

    // 2️⃣ Get sent & received requests
    const requestDoc = await firestore()
      .collection('friendRequests')
      .doc(userId)
      .get();
    const sent = requestDoc.exists
      ? Object.keys((requestDoc.data() as any)?.sent || {})
      : [];
    const received = requestDoc.exists
      ? Object.keys((requestDoc.data() as any)?.received || {})
      : [];

    // 3️⃣ Combine IDs to exclude
    const exclude = new Set([userId, ...friends, ...sent, ...received]);

    // 4️⃣ Fetch users and filter out excluded IDs
    const usersSnapshot = await firestore()
      .collection('users')
      .get();

    // 5️⃣ Map results to return user data excluding those in exclude
    return usersSnapshot.docs
      .filter(doc => !exclude.has(doc.id))
      .map(doc => ({
        id: doc.id,
        name: (doc.data() as any).name || 'Unknown',
        email: (doc.data() as any).email || 'No email',
        avatar: (doc.data() as any).avatar || null,
      }));
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return [];
  }
};
