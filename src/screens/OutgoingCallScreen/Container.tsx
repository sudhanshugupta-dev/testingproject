import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import {
  OutgoingCall,
  useStreamVideoClient,
  Call,
} from '@stream-io/video-react-native-sdk';

// Define navigation params
type RootStackParamList = {
  OutgoingAudio: { isVideo: boolean };
  VideoCall: { callId: string; targetUserId: string; isVideo: boolean };
};

// Props type for screen
type OutgoingCallScreenProps = {
  route: RouteProp<RootStackParamList, 'OutgoingAudio'>;
};

const OutgoingCallScreen: React.FC<OutgoingCallScreenProps> = ({ route }) => {
  const { isVideo } = route.params;
  const client = useStreamVideoClient();
  const [call, setCall] = useState<Call | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    if (!client) {
      setError('Stream client not available');
      setIsLoading(false);
      return;
    }

    const initializeCall = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Generate a unique call ID
        const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // For demo purposes, we'll use a placeholder target user ID
        // In a real app, this would come from the navigation params
        const targetUserId = 'demo_user_id'; // This should be passed from the calling screen
        
        const _call = client.call('default', callId);
        
        await _call.join({
          create: true,
          data: {
            members: [{ user_id: targetUserId }],
            video: isVideo, // true for video, false for audio
            custom: { 
              path: ['outgoing'],
              callType: isVideo ? 'video' : 'audio'
            },
          },
        });
        
        setCall(_call);
        console.log('OutgoingCallScreen: Call started successfully');
      } catch (err: any) {
        console.error('OutgoingCallScreen: Failed to start call:', err);
        setError(err.message || 'Failed to start call');
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
  }, [client, isVideo]);

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
        <Text style={styles.loadingText}>Starting call...</Text>
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

  return (
    <View style={styles.container}>
      <OutgoingCall
        onHangupCallHandler={hangup}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#000',
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

export default OutgoingCallScreen;
