import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import {
  IncomingCall,
  useStreamVideoClient,
  Call,
} from '@stream-io/video-react-native-sdk';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Define your navigation params
type RootStackParamList = {
  VideoCall: { callId: string; targetUserId: string; isVideo: boolean };
  Incoming: undefined;
};

const IncomingCallScreen: React.FC = () => {
  const client = useStreamVideoClient();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, we'll simulate no incoming calls
    // In a real app, you'd listen for incoming calls here
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Waiting for calls...</Text>
      </View>
    );
  }

  if (!activeCall) {
    return (
      <View style={styles.noCallContainer}>
        <Text style={styles.noCallText}>No incoming calls</Text>
        <Text style={styles.backText} onPress={() => navigation.goBack()}>
          Go Back
        </Text>
      </View>
    );
  }

  const acceptCall = (isVideo: boolean = true) => {
    try {
      activeCall.accept();
      // Navigate to video call screen with call details
      navigation.navigate('VideoCall', { 
        callId: activeCall.id,
        targetUserId: activeCall.state.createdBy?.id || 'unknown',
        isVideo: isVideo
      });
    } catch (error) {
      console.error('Failed to accept call:', error);
    }
  };

  const rejectCall = () => {
    try {
      activeCall.reject();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to reject call:', error);
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <IncomingCall
        onAcceptCallHandler={() => acceptCall(true)} // Assume video for now
        onRejectCallHandler={rejectCall}
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
  noCallContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  noCallText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
  },
  backText: {
    color: '#007AFF',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default IncomingCallScreen;
