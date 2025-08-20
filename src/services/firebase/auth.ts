import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In (call this during app initialization)
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: 'YOUR_WEB_CLIENT_ID', // From Firebase Console (Google Sign-In)
    offlineAccess: true,
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
    console.log('Sign-in successful:', result.user);
    return result;
  } catch (error: any) {
    console.error('Sign-in error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Failed to sign in: ${error.message} (Code: ${error.code})`);
  }
};

// Sign up with email and password
export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<any> => {
  try {
    console.log('Attempting sign-up with email:', email);
    const result = await auth().createUserWithEmailAndPassword(email, password);
    console.log('User account created & signed in:', result.user);
    return result;
  } catch (error: any) {
    console.error('Sign-up error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Failed to sign up: ${error.message} (Code: ${error.code})`);
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<any> => {
  try {
    // Check if Google Play Services are available
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Sign in with Google
    const { idToken } = await GoogleSignin.signIn();
    if (!idToken) {
      throw new Error('Failed to retrieve Google ID token');
    }
    // Create a Google credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    // Sign in with Firebase
    const result = await auth().signInWithCredential(googleCredential);
    console.log('Google sign-in successful:', result.user);
    return result;
  } catch (error: any) {
    console.error('Google sign-in error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Google sign-in failed: ${error.message} (Code: ${error.code})`);
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
    throw new Error(`Failed to send password reset email: ${error.message} (Code: ${error.code})`);
  }
};

// Verify OTP (placeholder, as Firebase doesn't use OTP for password reset)
export const verifyOTP = async (
  _email: string,
  _otp: string,
): Promise<boolean> => {
  // Firebase email-based password reset uses a link, not an OTP.
  // This is a placeholder; implement custom OTP logic if needed (e.g., with a backend).
  console.warn('verifyOTP is a placeholder. Firebase uses email links for password reset.');
  return _otp === '123456'; // Replace with actual logic if using custom OTP
};

// Reset password
export const resetPassword = async (
  newPassword: string,
): Promise<boolean> => {
  try {
    const user = auth().currentUser;
    if (!user) {
      throw new Error('No authenticated user to reset password');
    }
    await user.updatePassword(newPassword);
    console_rs = await user.reload();
    console.log('Password reset successful for user:', user.email);
    return true;
  } catch (error: any) {
    console.error('Password reset error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Failed to reset password: ${error.message} (Code: ${error.code})`);
  }
};

// Sign out
export const signOutFirebase = async (): Promise<void> => {
  try {
    await auth().signOut();
    console.log('User signed out successfully');
  } catch (error: any) {
    console.error('Sign-out error:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Failed to sign out: ${error.message} (Code: ${error.code})`);
  }
};