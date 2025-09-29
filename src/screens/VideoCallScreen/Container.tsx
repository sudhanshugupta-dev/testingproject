import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import {
  StreamCall,
  CallContent,
  useStreamVideoClient,
  useCall,
  useCallStateHooks,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ToggleCameraFaceButton,
  HangUpCallButton,
  Call,
} from '@stream-io/video-react-native-sdk';
import { useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import { useStreamClient } from '../../contexts/StreamProvider';
import { createCallWithUsers, getUserInfo } from '../../utils/streamUtils';

// Define navigation params
type RootStackParamList = {
  VideoCall: { callId: string; targetUserId: string; isVideo: boolean };
};

// Props type for screen
type VideoCallScreenProps = {
  route: RouteProp<RootStackParamList, 'VideoCall'>;
};

const VideoCallScreen: React.FC<VideoCallScreenProps> = ({ route }) => {
  const { callId, targetUserId, isVideo } = route.params;
  // Use both hooks to get the client - try Stream SDK first, fallback to our custom hook
  const sdkClient = useStreamVideoClient();
  const { client: customClient } = useStreamClient();
  const client = sdkClient || customClient;
  const [call, setCall] = useState<Call | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing call...');
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    console.log("Client", client);
    if (!client) {
      setError('Stream client not available');
      setIsLoading(false);
      return;
    }

    const initializeCall = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('VideoCallScreen: Initializing call with user:', targetUserId);
        
        setLoadingMessage('Fetching user information...');
        // Get user information for the target user
        const targetUserInfo = await getUserInfo(targetUserId);
        
        setLoadingMessage('Creating Stream users...');
        // Create call with proper user validation
        const callResult = await createCallWithUsers(
          client,
          'default',
          callId,
          [targetUserId], // Array of target user IDs
          {
            video: isVideo,
            custom: { 
              path: ['video-call'],
              callType: isVideo ? 'video' : 'audio'
            },
          },
          {
            [targetUserId]: targetUserInfo // User data for Stream user creation
          }
        );
        
        if (!callResult.success) {
          throw new Error(callResult.error || 'Failed to create call');
        }
        
        setLoadingMessage('Joining call...');
        setCall(callResult.call);
        console.log('VideoCallScreen: Call joined successfully');
      } catch (err: any) {
        console.error('VideoCallScreen: Failed to join call:', err);
        setError(err.message || 'Failed to join call');
      } finally {
        setIsLoading(false);
      }
    };

    initializeCall();

    return () => {
      if (call) {
        call.leave();
      }
    };
  }, [client, callId, targetUserId, isVideo]);

  const hangup = () => {
    if (call) {
      call.leave();
    }
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={() => navigation.goBack()}>
          Go Back
        </Text>
      </View>
    );
  }

  if (!call) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing call...</Text>
      </View>
    );
  }

  const CustomControls: React.FC = () => (
    <View style={styles.controls}>
      <ToggleAudioPublishingButton />
      <ToggleVideoPublishingButton />
      <ToggleCameraFaceButton />
      <HangUpCallButton onHangupCallHandler={hangup} />
    </View>
  );

  const CustomTopView: React.FC = () => {
    const { useParticipants } = useCallStateHooks();
    const participants = useParticipants();
    
    return (
      <Text style={styles.topText}>
        {isVideo ? 'Video Call' : 'Audio Call'} with {participants.map(p => p.name ?? 'Unknown').join(', ')}
      </Text>
    );
  };

  return (
    <StreamCall call={call}>
      <View style={styles.container}>
        <CallContent
          CallControls={CustomControls}
          initialInCallManagerAudioMode={isVideo ? "video" : "audio"}
        />
      </View>
    </StreamCall>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topText: { 
    color: 'white', 
    fontSize: 16, 
    textAlign: 'center',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default VideoCallScreen;
