import { FirebaseApp, initializeApp, FirebaseOptions } from '@react-native-firebase/app';

let app: FirebaseApp;

const firebaseConfig: FirebaseOptions = {
  // TODO: Replace with real config
    apiKey: "AIzaSyB33nDCqx2w4E5TGgWC9NyTbsLn94SleRY",
    authDomain: "chatapp-e6fb8.firebaseapp.com",
    databaseURL: "https://chatapp-e6fb8-default-rtdb.firebaseio.com",
    projectId: "chatapp-e6fb8",
    storageBucket: "chatapp-e6fb8.firebasestorage.app",
    messagingSenderId: "795608926313",
    appId: "1:795608926313:android:e2aa48be7d24090e44faf8",  
};

export const getFirebaseApp = () => {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
};
