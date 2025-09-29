# Stream.io Video Call Setup Guide

This guide will help you set up Stream.io video calling functionality in your React Native app.

## Prerequisites

1. A Stream.io account (sign up at https://getstream.io/)
2. Your Stream.io API credentials

## Setup Steps

### 1. Get Your Stream.io Credentials

1. Go to your [Stream.io Dashboard](https://getstream.io/dashboard/)
2. Create a new app or select an existing one
3. Go to the "API Keys" section
4. Copy your:
   - **API Key** (starts with something like `sh2esb6ray3x`)
   - **API Secret** (longer string, keep this secret!)

### 2. Configure Your App

1. Open `src/config/streamConfig.ts`
2. Replace the placeholder values:

```typescript
export const STREAM_CONFIG = {
  // Replace with your actual API key from Stream dashboard
  API_KEY: 'your_actual_api_key_here',
  
  // Replace with your actual API secret from Stream dashboard
  API_SECRET: 'your_actual_api_secret_here',
  
  // Optional: Change region if needed
  REGION: 'us-east', // or 'us-west', 'eu-west', 'asia-southeast1'
  
  // Token expiry (1 hour by default)
  TOKEN_EXPIRY: 60 * 60,
  
  // Call settings
  CALL_SETTINGS: {
    DEFAULT_CALL_TYPE: 'video',
    RING_TIMEOUT: 30,
    ENABLE_RECORDING: false,
  },
};
```

### 3. Test the Configuration

The app will automatically validate your configuration on startup. If there are any issues, you'll see error messages in the console.

### 4. Features Included

✅ **Video Calls**: Full video calling with camera controls  
✅ **Audio Calls**: Audio-only calling  
✅ **Call Controls**: Mute, camera toggle, hang up  
✅ **Incoming Calls**: Automatic call detection and UI  
✅ **Outgoing Calls**: Start calls from chat interface  
✅ **User Management**: Automatic user connection based on authentication  
✅ **Error Handling**: Comprehensive error handling and user feedback  

### 5. Usage

#### Starting a Call from Chat
1. Open any individual chat (not group chats)
2. Tap the video or phone icon in the header
3. The call will start automatically

#### Receiving Calls
1. When someone calls you, you'll see an incoming call screen
2. Tap "Accept" to join or "Reject" to decline
3. The call will automatically navigate to the video call interface

#### During a Call
- **Mute/Unmute**: Tap the microphone button
- **Camera On/Off**: Tap the camera button  
- **Hang Up**: Tap the red phone button

### 6. Troubleshooting

#### Common Issues

**"Stream API secret not configured"**
- Make sure you've updated `API_SECRET` in `streamConfig.ts`
- Ensure the secret is correct (no extra spaces, correct format)

**"Stream client not available"**
- Check that the user is properly authenticated
- Verify the Stream configuration is correct
- Check network connectivity

**"Failed to join call"**
- Ensure both users have valid Stream tokens
- Check that the target user ID is correct
- Verify network connectivity

#### Debug Mode

Enable debug logging by adding this to your app:

```typescript
// In your app initialization
console.log('Stream Config:', getStreamConfig());
```

### 7. Production Considerations

⚠️ **Security**: Never commit your API secret to version control in production!

For production apps:
1. Use environment variables for API keys
2. Implement server-side token generation
3. Add proper error monitoring
4. Test with multiple users and network conditions

### 8. Advanced Configuration

#### Custom Call Settings
You can customize call behavior in `streamConfig.ts`:

```typescript
CALL_SETTINGS: {
  DEFAULT_CALL_TYPE: 'video', // or 'audio'
  RING_TIMEOUT: 30, // seconds
  ENABLE_RECORDING: false, // requires premium plan
}
```

#### Custom User Images
The app automatically generates user avatars, but you can customize this in `StreamProvider.js`:

```typescript
const streamUser = { 
  id: userId, 
  name: userName, 
  image: `https://your-cdn.com/avatars/${userId}.jpg` // Custom avatar URL
};
```

### 9. Support

- [Stream.io Documentation](https://getstream.io/video/docs/)
- [Stream.io React Native SDK](https://github.com/GetStream/stream-video-react-native)
- [Stream.io Support](https://getstream.io/support/)

## Next Steps

1. Test the video calling with multiple devices
2. Customize the UI to match your app's design
3. Add call history and call logs
4. Implement push notifications for incoming calls
5. Add group video calling (requires additional setup)
