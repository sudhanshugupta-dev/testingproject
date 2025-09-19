import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('lottie-react-native', () => 'LottieView');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('@react-native-firebase/app', () => ({}));
jest.mock('@react-native-firebase/auth', () => {
  const auth = () => ({
    currentUser: { uid: 'test-user' },
    signInWithEmailAndPassword: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    onAuthStateChanged: (cb: any) => { cb({ uid: 'test-user', email: 'test@example.com' }); return () => {}; },
    signOut: jest.fn(),
    GoogleAuthProvider: { credential: jest.fn() },
  });
  auth.GoogleAuthProvider = { credential: jest.fn() };
  return auth;
});
jest.mock('@react-native-firebase/firestore', () => {
  const mockDoc = () => ({
    get: jest.fn().mockResolvedValue({ exists: false, data: () => ({}), id: 'doc' }),
    set: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    onSnapshot: jest.fn().mockImplementation((success: any) => { success({ docs: [] }); return () => {}; }),
  });
  const firestore = () => ({
    collection: jest.fn(() => mockDoc()),
    batch: jest.fn(() => ({ set: jest.fn(), update: jest.fn(), commit: jest.fn().mockResolvedValue(undefined) })),
    FieldValue: { serverTimestamp: () => new Date(), arrayUnion: (...args: any[]) => args },
  });
  firestore.FieldValue = { serverTimestamp: () => new Date(), arrayUnion: (...args: any[]) => args };
  return firestore;
});

// Mock push notifications modules used only in app runtime
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
}));
jest.mock('@react-native-community/push-notification-ios', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setApplicationIconBadgeNumber: jest.fn(),
}));

// Mock react-native-fs used by downloadService
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  DownloadDirectoryPath: '/mock/downloads',
  exists: jest.fn().mockResolvedValue(false),
  stat: jest.fn().mockResolvedValue({ size: 123 }),
  readDir: jest.fn().mockResolvedValue([]),
  unlink: jest.fn().mockResolvedValue(undefined),
  downloadFile: jest.fn().mockReturnValue({
    promise: Promise.resolve({ statusCode: 200 }),
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => new Promise(() => {}) } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

jest.mock('react-native-nitro-sound', () => ({
  startRecorder: jest.fn().mockResolvedValue('test-recording-path'),
  stopRecorder: jest.fn().mockResolvedValue('test-recording-path'),
  startPlayer: jest.fn().mockResolvedValue('test-playback-path'),
  stopPlayer: jest.fn().mockResolvedValue('test-playback-path'),
  pausePlayer: jest.fn().mockResolvedValue('test-pause-path'),
  seekToPlayer: jest.fn().mockResolvedValue('test-seek-path'),
  addRecordBackListener: jest.fn(),
  removeRecordBackListener: jest.fn(),
  addPlayBackListener: jest.fn(),
  removePlayBackListener: jest.fn(),
  mmssss: jest.fn((time) => `00:${time.toString().padStart(2, '0')}`),
}));

jest.mock('react-native-permissions', () => ({
  request: jest.fn().mockResolvedValue('granted'),
  PERMISSIONS: {
    IOS: { MICROPHONE: 'ios.permission.MICROPHONE' },
    ANDROID: { RECORD_AUDIO: 'android.permission.RECORD_AUDIO' },
  },
  RESULTS: { GRANTED: 'granted' },
})); 

// Mock react-native-modal to a simple passthrough component
jest.mock('react-native-modal', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ children, ...props }) => <View {...props}>{children}</View>;
});