module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native'
      + '|@react-native'
      + '|react-native-vector-icons'
      + '|@react-navigation'
      + '|react-redux'
      + '|react-native-linear-gradient'
      + '|@react-native-firebase'
      + '|@react-native-google-signin'
      + '|react-native-toast-message'
      + ')/)'
  ],
  moduleNameMapper: {
    '\\.(svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@react-native-google-signin/google-signin$': '<rootDir>/__mocks__/googleSigninMock.js'
  },
};
