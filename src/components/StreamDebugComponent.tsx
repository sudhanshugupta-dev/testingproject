import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useStreamClient } from '../contexts/StreamProvider';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export const StreamDebugComponent: React.FC = () => {
  const { client, isConnecting } = useStreamClient();
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  useEffect(() => {
    const info = [
      `StreamProvider Status: ${client ? 'Connected' : 'Not Connected'}`,
      `Is Connecting: ${isConnecting}`,
      `User: ${user ? `${user.name || user.email} (${user.uid})` : 'Not authenticated'}`,
      `Token: ${token ? 'Present' : 'Missing'}`,
      `Timestamp: ${new Date().toLocaleTimeString()}`,
    ];
    setDebugInfo(info);
  }, [client, isConnecting, user, token]);

  const testConnection = () => {
    try {
      if (client) {
        console.log('Stream client is available:', client);
        setDebugInfo(prev => [...prev, '✅ Stream client test passed']);
      } else {
        setDebugInfo(prev => [...prev, '❌ Stream client is null']);
      }
    } catch (error: any) {
      setDebugInfo(prev => [...prev, `❌ Error: ${error.message}`]);
    }
  };

  const clearLogs = () => setDebugInfo([]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Stream Debug Information</Text>

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

        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Clear Logs</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Troubleshooting Steps:</Text>
        <Text style={styles.instructionsText}>
          1. Check if user is authenticated{'\n'}
          2. Verify Stream configuration{'\n'}
          3. Check console for error messages{'\n'}
          4. Ensure API keys are configured{'\n'}
          5. Restart the app if needed
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
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
  debugText: { fontSize: 14, color: '#333', marginBottom: 5, fontFamily: 'monospace' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  clearButton: { backgroundColor: '#FF5722' },
  buttonText: { color: 'white', fontSize: 16, fontWeight: '600' },
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
  instructionsTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  instructionsText: { fontSize: 14, color: '#666', lineHeight: 20 },
});
