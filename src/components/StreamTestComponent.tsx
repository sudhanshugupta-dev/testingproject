import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useStreamClient } from '../contexts/StreamProvider';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { StreamDebugComponent } from './StreamDebugComponent';

export const StreamTestComponent: React.FC = () => {
  const { client, isConnecting } = useStreamClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const [connectionStatus, setConnectionStatus] = useState<string>('Not connected');
  const [showDebug, setShowDebug] = useState<boolean>(false);

  useEffect(() => {
    if (client) {
      setConnectionStatus('Connected to Stream');
    } else if (isConnecting) {
      setConnectionStatus('Connecting...');
    } else {
      setConnectionStatus('Not connected');
    }
  }, [client, isConnecting]);

  const testConnection = () => {
    if (!client) {
      Alert.alert('Error', 'Stream client not available');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    Alert.alert('Success', `Stream client is connected for user: ${user.name || user.email}`);
  };

  const startTestCall = () => {
    if (!client) {
      Alert.alert('Error', 'Stream client not available');
      return;
    }

    // This would start a test call
    Alert.alert('Info', 'Test call functionality would be implemented here');
  };

  if (showDebug) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowDebug(false)}
        >
          <Text style={styles.backButtonText}>← Back to Test</Text>
        </TouchableOpacity>
        <StreamDebugComponent />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Stream.io Test Component</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Connection Status:</Text>
        <Text style={[
          styles.statusText,
          { color: client ? '#4CAF50' : isConnecting ? '#FF9800' : '#F44336' }
        ]}>
          {connectionStatus}
        </Text>
      </View>

      <View style={styles.userContainer}>
        <Text style={styles.userLabel}>Current User:</Text>
        <Text style={styles.userText}>
          {user ? `${user.name || user.email} (${user.uid})` : 'Not authenticated'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2196F3' }]}
          onPress={testConnection}
          disabled={!client}
        >
          <Text style={styles.buttonText}>Test Connection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={startTestCall}
          disabled={!client}
        >
          <Text style={styles.buttonText}>Test Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF9800' }]}
          onPress={() => setShowDebug(true)}
        >
          <Text style={styles.buttonText}>Debug Info</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Setup Instructions:</Text>
        <Text style={styles.infoText}>
          1. Update your Stream API key in src/config/streamConfig.ts{'\n'}
          2. Update your Stream API secret in src/config/streamConfig.ts{'\n'}
          3. Restart the app to apply changes{'\n'}
          4. Check the console for any error messages
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  userContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  userText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});
