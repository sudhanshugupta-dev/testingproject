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

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { changeLanguage: () => new Promise(() => {}) } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
})); 