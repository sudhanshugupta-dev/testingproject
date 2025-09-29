import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { useStreamClient } from '../../contexts/StreamProvider';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const StreamDebugScreen: React.FC = () => {
  const sdkClient = useStreamVideoClient();
  const { client: customClient, isConnecting, connectUser } = useStreamClient();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const updateInfo = () => {
      const info = [
        `=== Stream Debug Info ===`,
        `Timestamp: ${new Date().toLocaleTimeString()}`,
        ``,
        `=== Client Status ===`,
        `SDK Client: ${sdkClient ? '✅ Available' : '❌ Not Available'}`,
        `Custom Client: ${customClient ? '✅ Available' : '❌ Not Available'}`,
        `Is Connecting: ${isConnecting ? 'Yes' : 'No'}`,
        ``,
        `=== Auth Status ===`,
        `User: ${user ? `${user.name || user.email} (${user.uid})` : '❌ Not authenticated'}`,
        `Token: ${token ? '✅ Present' : '❌ Missing'}`,
        ``,
        `=== Client Details ===`,
        `SDK Client Type: ${sdkClient ? typeof sdkClient : 'N/A'}`,
        `Custom Client Type: ${customClient ? typeof customClient : 'N/A'}`,
      ];

      if (sdkClient) {
        info.push(`SDK Client Connected: ${sdkClient.user ? '✅ Yes' : '❌ No'}`);
        info.push(`SDK User ID: ${sdkClient.user?.id || 'N/A'}`);
        info.push(`SDK User Name: ${sdkClient.user?.name || 'N/A'}`);
      }

      if (customClient) {
        info.push(`Custom Client Connected: ${customClient.user ? '✅ Yes' : '❌ No'}`);
        info.push(`Custom User ID: ${customClient.user?.id || 'N/A'}`);
        info.push(`Custom User Name: ${customClient.user?.name || 'N/A'}`);
      }

      setDebugInfo(info);
    };

    updateInfo();
    const interval = setInterval(updateInfo, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [sdkClient, customClient, isConnecting, user, token]);

  const testConnection = () => {
    try {
      const client = sdkClient || customClient;
      if (client) {
        console.log('Stream client is available:', client);
        Alert.alert('Success', 'Stream client is available!');
        setDebugInfo(prev => [...prev, `✅ Test passed: Client is available`]);
      } else {
        Alert.alert('Error', 'No Stream client available');
        setDebugInfo(prev => [...prev, `❌ Test failed: No client available`]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setDebugInfo(prev => [...prev, `❌ Error: ${error.message}`]);
    }
  };

  const manualConnect = async () => {
    if (!user) {
      Alert.alert('Error', 'No user authenticated');
      return;
    }

    try {
      await connectUser(user.uid, user.name || user.email || 'User');
      Alert.alert('Success', 'Manual connection initiated');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const testVideoCall = () => {
    const client = sdkClient || customClient;
    if (!client) {
      Alert.alert('Error', 'No Stream client available for video call');
      return;
    }

    try {
      const testCall = client.call('default', 'test-call-123');
      Alert.alert('Success', 'Video call object created successfully!');
      setDebugInfo(prev => [...prev, `✅ Video call test passed`]);
    } catch (error: any) {
      Alert.alert('Error', `Video call test failed: ${error.message}`);
      setDebugInfo(prev => [...prev, `❌ Video call error: ${error.message}`]);
    }
  };

  const clearLogs = () => setDebugInfo([]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Stream Client Debug</Text>

      <View style={styles.statusContainer}>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.debugText}>
            {info}
          </Text>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testConnection}>
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={manualConnect}>
          <Text style={styles.buttonText}>Manual Connect</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testVideoCall}>
          <Text style={styles.buttonText}>Test Video Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Troubleshooting:</Text>
        <Text style={styles.instructionsText}>
          1. Ensure you're logged in{'\n'}
          2. Check if Stream API keys are configured{'\n'}
          3. Verify token server is running on port 5000{'\n'}
          4. Check console for detailed error messages{'\n'}
          5. Try manual reconnection if auto-connect fails
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20, 
    color: '#333' 
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debugText: { 
    fontSize: 12, 
    color: '#333', 
    marginBottom: 2, 
    fontFamily: 'monospace' 
  },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 15 
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  clearButton: { 
    backgroundColor: '#FF5722' 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionsTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 10 
  },
  instructionsText: { 
    fontSize: 14, 
    color: '#666', 
    lineHeight: 20 
  },
});

export default StreamDebugScreen;
