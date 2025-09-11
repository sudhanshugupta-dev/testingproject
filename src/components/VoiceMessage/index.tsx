// VoiceMessage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Platform, Alert, Linking 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';


// Import react-native-nitro-sound correctly
import Sound from 'react-native-nitro-sound';

console.log('🎤 VoiceMessage component loaded');
console.log('🎤 Sound import type:', typeof Sound);
console.log('🎤 Sound methods available:', Object.getOwnPropertyNames(Sound));

interface VoiceMessageProps {
  onSend?: (uri: string) => void;
  onCancel?: () => void;
  autoStart?: boolean;
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ onSend, onCancel, autoStart = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);

  // Format time to mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Check and request permissions
  useEffect(() => {
    checkPermissions();

    // Cleanup on unmount
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (isPlaying) {
        stopPlay();
      }
      // Clean up Sound listeners
      try {
        Sound.removeRecordBackListener();
        Sound.removePlayBackListener();
      } catch (e) {
        console.log('🎤 Cleanup error:', e);
      }
    };
  }, []);

  const checkPermissions = async () => {
    try {
      let permissionStatus;
      if (Platform.OS === 'ios') {
        permissionStatus = await request(PERMISSIONS.IOS.MICROPHONE);
      } else {
        permissionStatus = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      }
      setHasPermission(permissionStatus === RESULTS.GRANTED);
    } catch (error) {
      console.error('Permission error:', error);
      setHasPermission(false);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Microphone permission is required to record.');
      return;
    }

    try {
      console.log('🎤 Starting recording with Sound singleton...');
      
      // Use Sound singleton directly (not as constructor)
      // Start recording using the singleton instance
      const recordingPath = await Sound.startRecorder();
      console.log('🎤 Recording started at:', recordingPath);
      
      // Store the path for later use
      soundRef.current = recordingPath;
      
      setIsRecording(true);
      startTimeRef.current = Date.now();
      elapsedTimeRef.current = 0;
      
      // Set up recording progress listener
      Sound.addRecordBackListener((e: any) => {
        console.log('🎤 Recording progress:', e.currentPosition);
        const timeString = Sound.mmssss(Math.floor(e.currentPosition));
        setRecordTime(timeString);
        elapsedTimeRef.current = Math.floor(e.currentPosition / 1000);
      });
    } catch (error: any) {
      console.error('🎤 Recording error:', error);
      Alert.alert('Error', `Failed to start recording: ${error.message || 'Unknown error'}`);
    }
  };

  // Stop recording
  const stopRecording = async () => {
    try {
      console.log('🎤 Stopping recording...');
      
      // Stop recording using Sound singleton
      const recordedFilePath = await Sound.stopRecorder();
      console.log('🎤 Recording stopped, file:', recordedFilePath);
      
      // Remove the recording listener
      Sound.removeRecordBackListener();
      
      setIsRecording(false);
      setFilePath(recordedFilePath);
      setDuration(formatTime(elapsedTimeRef.current));
      
      // Set the file path for playback
      soundRef.current = recordedFilePath;
      
      // Set duration based on recording time
      setDuration(formatTime(elapsedTimeRef.current));

    } catch (error: any) {
      console.error('🎤 Stop recording error:', error);
      Alert.alert('Error', `Failed to stop recording: ${error.message || 'Unknown error'}`);
    }
  };

  // Start playback
  const startPlay = async () => {
    if (!filePath) {
      Alert.alert('Error', 'No recording available to play.');
      return;
    }

    try {
      console.log('🎤 Starting playback for:', filePath);
      
      // Set up playback progress listener
      Sound.addPlayBackListener((e: any) => {
        console.log('🎤 Playback progress:', e.currentPosition, e.duration);
        const currentTime = Sound.mmssss(Math.floor(e.currentPosition));
        const totalDuration = Sound.mmssss(Math.floor(e.duration));
        setPlayTime(currentTime);
        setDuration(totalDuration);
        
        // Check if playback finished
        if (e.currentPosition >= e.duration) {
          console.log('🎤 Playback finished');
          stopPlay();
        }
      });
      
      // Start playing the recorded file
      await Sound.startPlayer(filePath);
      setIsPlaying(true);
    } catch (error: any) {
      console.error('🎤 Playback error:', error);
      Alert.alert('Error', `Failed to play recording: ${error.message || 'Unknown error'}`);
    }
  };

  // Stop playback
  const stopPlay = async () => {
    try {
      console.log('🎤 Stopping playback...');
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00');
    } catch (error: any) {
      console.error('🎤 Stop playback error:', error);
    }
  };

  // Pause playback
  const pausePlay = async () => {
    try {
      console.log('🎤 Pausing playback...');
      await Sound.pausePlayer();
      setIsPlaying(false);
    } catch (error: any) {
      console.error('🎤 Pause playback error:', error);
    }
  };

  // Toggle playback (play/pause)
  const togglePlayback = async () => {
    if (isPlaying) {
      await pausePlay();
    } else {
      await startPlay();
    }
  };

  // Seek forward/backward
  const seekForward = async () => {
    try {
      console.log('🎤 Seeking forward 5 seconds...');
      // Note: Seeking might not be available in all versions
      // This is a placeholder - check if seekToPlayer exists
      if (Sound.seekToPlayer) {
        await Sound.seekToPlayer(5000); // 5 seconds in milliseconds
      }
    } catch (error: any) {
      console.error('🎤 Seek forward error:', error);
    }
  };

  const seekBackward = async () => {
    try {
      console.log('🎤 Seeking backward 5 seconds...');
      // Note: Seeking might not be available in all versions
      if (Sound.seekToPlayer) {
        await Sound.seekToPlayer(-5000); // -5 seconds in milliseconds
      }
    } catch (error: any) {
      console.error('🎤 Seek backward error:', error);
    }
  };

  // Handle mic button
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!filePath) {
      startRecording();
    }
  };

  // Send recording
  const handleSend = () => {
    if (filePath && onSend) {
      console.log('🎤 Sending recording:', filePath);
      onSend(filePath);
      resetState();
    } else {
      Alert.alert('Error', 'No recording to send.');
    }
  };

  // Re-record
  const handleRerecord = () => {
    if (isPlaying) {
      stopPlay();
    }
    resetState();
  };

  // Reset state
  const resetState = async () => {
    console.log('🎤 Resetting state...');
    
    // Stop any ongoing operations
    if (isRecording) {
      try {
        await Sound.stopRecorder();
        Sound.removeRecordBackListener();
      } catch (e) {
        console.log('🎤 Error stopping recorder during reset:', e);
      }
    }
    
    if (isPlaying) {
      try {
        await Sound.stopPlayer();
        Sound.removePlayBackListener();
      } catch (e) {
        console.log('🎤 Error stopping player during reset:', e);
      }
    }
    
    soundRef.current = null;
    setFilePath(null);
    setIsRecording(false);
    setIsPlaying(false);
    setRecordTime('00:00');
    setPlayTime('00:00');
    setDuration('00:00');
    elapsedTimeRef.current = 0;
  };

  // Cancel
  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    if (isPlaying) {
      stopPlay();
    }
    resetState();
    onCancel?.();
  };

  // Request permission
  const requestPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const result = await request(PERMISSIONS.IOS.MICROPHONE);
        setHasPermission(result === RESULTS.GRANTED);
      } else {
        const result = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
        setHasPermission(result === RESULTS.GRANTED);
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  // Show permission UI if needed
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Icon name="mic-off" size={48} color="#ff6b6b" />
          <Text style={styles.permissionText}>Microphone Access Required</Text>
          <Text style={styles.permissionSubtext}>
            Please allow microphone access to record voice messages
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!filePath ? (
        // Recording UI
        <View style={styles.recordSection}>
          <View style={styles.timerContainer}>
            <Icon name="mic" size={24} color={isRecording ? '#ff4444' : '#666'} />
            <Text style={styles.timer}>{recordTime}</Text>
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.pulseDot} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.recordButton,
              { backgroundColor: isRecording ? '#ff4444' : '#4CAF50' }
            ]}
            onPress={handleMicClick}
          >
            <Icon name="mic" size={36} color="white" />
          </TouchableOpacity>

          <Text style={styles.instructionText}>
            {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
          </Text>

          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Icon name="close" size={20} color="white" />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Playback UI
        <View style={styles.playSection}>
          <View style={styles.recordingInfo}>
            <Icon name="checkmark-circle" size={24} color="#28a745" />
            <Text style={styles.recordingCompleteText}>Recording Complete</Text>
          </View>

          <View style={styles.timerContainer}>
            <Icon name="musical-notes" size={24} color="#666" />
            <Text style={styles.timer}>
              {playTime} / {duration}
            </Text>
          </View>

          <View style={styles.playbackControls}>
            <TouchableOpacity style={styles.controlButton} onPress={seekBackward}>
              <Icon name="play-back" size={24} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.playButton,
                { backgroundColor: isPlaying ? '#ff9800' : '#2196F3' }
              ]}
              onPress={togglePlayback}
            >
              <Icon name={isPlaying ? 'pause' : 'play'} size={32} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={seekForward}>
              <Icon name="play-forward" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Icon name="send" size={20} color="white" />
              {/* <Text style={styles.actionText}>Send</Text> */}
            </TouchableOpacity>

            <TouchableOpacity style={styles.rerecordButton} onPress={handleRerecord}>
              <Icon name="refresh" size={20} color="white" />
              <Text style={styles.actionText}>Re-record</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Icon name="close" size={20} color="white" />
              {/* <Text style={styles.actionText}>Cancel</Text> */}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Keep your existing styles from the previous implementation
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#4263eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  recordSection: {
    alignItems: 'center',
    width: '100%',
  },
  playSection: {
    alignItems: 'center',
    width: '100%',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timer: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
   // paddingHorizontal: 10,
  },
  sendButton: {
    flexDirection: 'row',
    //alignItems: 'center',
    backgroundColor: '#28a745',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  rerecordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fd7e14',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  cancelText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4444',
    marginRight: 8,
  },
  recordingText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '600',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#d4edda',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recordingCompleteText: {
    color: '#28a745',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default VoiceMessage;