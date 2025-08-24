import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In (call this during app initialization)
// export const configureGoogleSignIn = () => {
//   GoogleSignin.configure({
//     webClientId: '795608926313-e4mrkvn248a7fjpi077j1ilq0f80mak4.apps.googleusercontent.com', // Replace with your Firebase Console Google Sign-In webClientId
//     offlineAccess: true,
//   });
// };

// Add user to Firestore
const addUserToFirestore = async (
  user: any,
  displayName?: string | null,
): Promise<void> => {
  try {
    if (!user.uid) {
      throw new Error('User UID is missing');
    }
    if (!user.email) {
      throw new Error('User email is missing');
    }

    console.log('Attempting to add user to Firestore:', user.uid);
    const userRef = firestore().collection('users').doc(user.uid);

    // Check if user document exists
    const userDoc = await userRef.get();
    console.log('DDS', userDoc.id);
    if (userDoc.id) {
      const userData = {
        id: user.uid,
        name:
          displayName ||
          user.displayName ||
          user.email.split('@')[0].replace(/\./g, ' '),
        email: user.email,
        avatar:
          user.photoURL ||
          'https://firebasestorage.googleapis.com/v0/b/YOUR_PROJECT_ID.appspot.com/o/avatars%2Fdefault.jpg?alt=media',
        createdAt: firestore.FieldValue.serverTimestamp(),
        emailLowercase: user.email.toLowerCase(), // For case-insensitive search
      };
      await userRef.set(userData);
      console.log('User added to Firestore successfully:', userData);
    } else {
      console.log('User already exists in Firestore:', user.uid);
    }
  } catch (error: any) {
    console.error('Error adding user to Firestore:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      userId: user.uid,
      email: user.email,
    });
    throw new Error(
      `Failed to add user to Firestore: ${error.message} (Code: ${
        error.code || 'unknown'
      })`,
    );
  }
};

// Wait for authentication state to stabilize
const waitForAuthState = async (): Promise<auth.User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth().onAuthStateChanged(
      user => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          reject(new Error('User not authenticated'));
        }
      },
      error => {
        unsubscribe();
        reject(error);
      },
    );
  });
};

// Sign in with email and password
export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<any> => {
  try {
    console.log('Attempting sign-in with email:', email);
    const result = await auth().signInWithEmailAndPassword(email, password);
    await waitForAuthState();
    console.log('Sign-in successful:', result.user.uid);
    return result;
  } catch (error: any) {
    console.error('Sign-in error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to sign in: ${error.message} (Code: ${error.code})`,
    );
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<any> => {
  try {
    console.log('Attempting sign-up with email:', email);
    const result = await auth().createUserWithEmailAndPassword(email, password);
    const user = await waitForAuthState();
    await addUserToFirestore(user, displayName);
    await user.updateProfile({
      displayName: displayName || user.email?.split('@')[0],
    });
    console.log('User account created & signed in:', user.uid);
    return result;
  } catch (error: any) {
    console.error('Sign-up error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to sign up: ${error.message} (Code: ${error.code})`,
    );
  }
};




export const signInWithGoogle = async (): Promise<any> => {
  try {
    // Configure Google Sign-In (if not already in App.tsx)
    GoogleSignin.configure({
      webClientId: '795608926313-e4mrkvn248a7fjpi077j1ilq0f80mak4.apps.googleusercontent.com', // Replace with your Firebase Web Client ID
      offlineAccess: true,
    });

   
   // Check Google Play Services
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Play Services available');
    } catch (playError: any) {
      console.error('Play Services check failed:', playError);
      throw new Error(`Play Services error: ${playError.message} (Code: ${playError.code})`);
    }

  // Sign in with Google
  let userInfo;
  try {
    userInfo = await GoogleSignin.signIn();
    console.log('GoogleSignin.signIn result:', JSON.stringify(userInfo, null, 2));
  } catch (signInError: any) {
    console.error('GoogleSignin.signIn error:', signInError);
    if (signInError.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('User cancelled the sign-in process');
    } else if (signInError.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign-in operation already in progress');
    } else if (signInError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play Services not available');
    }
    throw new Error(`Google sign-in failed: ${signInError.message} (Code: ${signInError.code})`);
  }

    // Extract idToken from userInfo.data
    const { idToken } = userInfo.data; // Updated to access idToken correctly
    if (!idToken) {
      throw new Error('Failed to retrieve Google ID token');
    }

    // Create Firebase credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign in with Firebase
    const result = await auth().signInWithCredential(googleCredential);

    // Assuming waitForAuthState and addUserToFirestore are defined elsewhere
    const user = await waitForAuthState();
    await addUserToFirestore(user);

    console.log('Google sign-in successful:', user.uid);
    return result;
  } catch (error: any) {
    console.error('Google sign-in error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: error,
    });
    throw new Error(
      `Google sign-in failed: ${error.message} (Code: ${error.code || 'unknown'})`,
    );
  }
};

// Send password reset email
export const sendPasswordResetOTP = async (email: string): Promise<boolean> => {
  try {
    await auth().sendPasswordResetEmail(email);
    console.log('Password reset email sent to:', email);
    return true;
  } catch (error: any) {
    console.error('Password reset error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to send password reset email: ${error.message} (Code: ${error.code})`,
    );
  }
};

// Verify OTP (placeholder)
export const verifyOTP = async (
  _email: string,
  _otp: string,
): Promise<boolean> => {
  console.warn(
    'verifyOTP is a placeholder. Firebase uses email links for password reset.',
  );
  return _otp === '123456'; // Replace with custom OTP logic if needed
};

// Reset password
export const resetPassword = async (newPassword: string): Promise<boolean> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user to reset password');
    }
    await user.updatePassword(newPassword);
    await user.reload();
    console.log('Password reset successful for user:', user.email);
    return true;
  } catch (error: any) {
    console.error('Password reset error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(
      `Failed to reset password: ${error.message} (Code: ${error.code})`,
    );
  }
};

// Sign out
export const signOutFirebase = async (): Promise<void> => {
  try {
    // Check if user is signed in with Google
 //  const isSignedInWithGoogle = await GoogleSignin.isSignedIn();
    
    // Sign out from Firebase
    await auth().signOut;
    
    // Sign out from Google if signed in with Google
    // if (isSignedInWithGoogle) {
    //   try {
    //     await GoogleSignin.revokeAccess();
    //     await GoogleSignin.signOut();
    //     console.log('Google sign-out successful');
    //   } catch (googleSignOutError: any) {
    //     console.warn('Google sign-out warning (may not affect Firebase logout):', googleSignOutError.message);
    //     // Don't throw error for Google sign-out issues as Firebase logout was successful
    //   }
    // }
    
    console.log('User signed out successfully');
   } 
   //catch (error: any) {
  //   console.error('Sign-out error:', {
  //     message: error.message,
  //     code: error.code,
  //     stack: error.stack,
  //   });
  //   throw new Error(
  //     `Failed to sign out: ${error.message} (Code: ${error.code})`,
  //   );
  // }
};
