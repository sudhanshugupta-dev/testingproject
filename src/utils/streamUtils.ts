import { StreamVideoClient } from '@stream-io/video-react-native-sdk';
import firestore from '@react-native-firebase/firestore';

/**
 * Creates or updates a user on Stream servers
 * This is required before adding users to calls
 */
export const createStreamUser = async (
  client: StreamVideoClient,
  userId: string,
  userData: { name?: string; email?: string; image?: string } = {}
) => {
  try {
    const streamUser = {
      id: userId,
      name: userData.name || userData.email || `User ${userId.substring(0, 8)}`,
      image: userData.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || userData.email || 'User')}&background=random`,
      role: 'user', // Add role field for better organization
    };

    // Use the upsertUsers method to create or update the user
    const response = await client.upsertUsers([streamUser]);
    
    console.log(`StreamUtils: User ${userId} created/updated successfully`, response);
    return { success: true, user: streamUser };
  } catch (error: any) {
    console.error(`StreamUtils: Failed to create user ${userId}:`, error);
    return { success: false, error: error.message || 'Failed to create user' };
  }
};

/**
 * Ensures multiple users exist on Stream before creating a call
 */
export const ensureUsersExist = async (
  client: StreamVideoClient,
  userIds: string[],
  usersData: { [userId: string]: { name?: string; email?: string; image?: string } } = {}
) => {
  try {
    const results = await Promise.all(
      userIds.map(userId => 
        createStreamUser(client, userId, usersData[userId] || {})
      )
    );

    const failedUsers = results.filter(result => !result.success);
    
    if (failedUsers.length > 0) {
      console.error('StreamUtils: Some users failed to create:', failedUsers);
      return { 
        success: false, 
        error: `Failed to create ${failedUsers.length} users`,
        failedUsers 
      };
    }

    console.log('StreamUtils: All users created successfully');
    return { success: true, createdUsers: results.map(r => r.user) };
  } catch (error: any) {
    console.error('StreamUtils: Failed to ensure users exist:', error);
    return { success: false, error: error.message || 'Failed to ensure users exist' };
  }
};

/**
 * Safely creates a call with user validation
 */
export const createCallWithUsers = async (
  client: StreamVideoClient,
  callType: string,
  callId: string,
  targetUserIds: string[],
  callData: any = {},
  usersData: { [userId: string]: { name?: string; email?: string; image?: string } } = {}
) => {
  try {
    // First, ensure all target users exist on Stream
    console.log('StreamUtils: Ensuring users exist before creating call...');
    const userCreationResult = await ensureUsersExist(client, targetUserIds, usersData);
    
    if (!userCreationResult.success) {
      throw new Error(userCreationResult.error || 'Failed to create users');
    }

    // Create the call
    const call = client.call(callType, callId);
    
    // Join the call with the validated members
    const joinResult = await call.join({
      create: true,
      data: {
        members: targetUserIds.map(userId => ({ user_id: userId })),
        ...callData,
      },
    });

    console.log('StreamUtils: Call created successfully with all users');
    return { success: true, call, joinResult };
  } catch (error: any) {
    console.error('StreamUtils: Failed to create call with users:', error);
    return { success: false, error: error.message || 'Failed to create call' };
  }
};

/**
 * Gets user information from Firebase Firestore
 */
export const getUserInfo = async (userId: string): Promise<{ name?: string; email?: string; image?: string }> => {
  try {
    console.log(`StreamUtils: Fetching user info for ${userId}`);
    
    const userDoc = await firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      console.log(`StreamUtils: User ${userId} not found in Firestore`);
      // Return default values if user doesn't exist
      return {
        name: `User ${userId.substring(0, 8)}`,
        email: `${userId}@unknown.com`,
        image: `https://ui-avatars.com/api/?name=User&background=random`
      };
    }
    
    const userData = userDoc.data() as any;
    const userInfo = {
      name: userData?.name || userData?.email || `User ${userId.substring(0, 8)}`,
      email: userData?.email || `${userId}@unknown.com`,
      image: userData?.avatar || userData?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&background=random`
    };
    
    console.log(`StreamUtils: Retrieved user info for ${userId}:`, userInfo);
    return userInfo;
  } catch (error) {
    console.error(`StreamUtils: Failed to get user info for ${userId}:`, error);
    // Return fallback data in case of error
    return {
      name: `User ${userId.substring(0, 8)}`,
      email: `${userId}@error.com`,
      image: `https://ui-avatars.com/api/?name=Error&background=red`
    };
  }
};
