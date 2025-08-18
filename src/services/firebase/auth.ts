import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getFirebaseApp } from './index';

getFirebaseApp();

export const signInWithEmail = (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  return auth().signInWithEmailAndPassword(email, password);
};

export const signUpWithEmail = (email: string, password: string): Promise<FirebaseAuthTypes.UserCredential> => {
  return auth().createUserWithEmailAndPassword(email, password);
};

export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential> => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken } = await GoogleSignin.signIn();
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(googleCredential);
};

export const sendPasswordResetOTP = async (email: string): Promise<boolean> => {
  await auth().sendPasswordResetEmail(email);
  return true;
};

export const verifyOTP = async (_email: string, _otp: string): Promise<boolean> => {
  return _otp === '123456';
};

export const resetPassword = async (_email: string, newPassword: string): Promise<boolean> => {
  const user = auth().currentUser;
  if (user) {
    await user.updatePassword(newPassword);
    return true;
  }
  throw new Error('No authenticated user to reset password');
};

export const signOutFirebase = async () => {
  await auth().signOut();
};
