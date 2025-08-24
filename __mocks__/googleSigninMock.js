module.exports = {
  GoogleSignin: {
    hasPlayServices: jest.fn().mockResolvedValue(true),
    configure: jest.fn(),
    signIn: jest.fn().mockResolvedValue({ idToken: 'token' }),
    signOut: jest.fn(),
    revokeAccess: jest.fn(),
    getCurrentUser: jest.fn().mockReturnValue(null),
    addScopes: jest.fn(),
    signInSilently: jest.fn().mockResolvedValue({ type: 'success', data: {} }),
  },
}; 