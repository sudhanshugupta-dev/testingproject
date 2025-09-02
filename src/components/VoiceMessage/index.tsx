// VoiceMessage.tsx
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

interface VoiceMessageProps {
  onSend?: (uri: string, duration: number) => void; // callback when recording finishes
=======
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = AudioRecorderPlayer; // ✅ no "new"

interface VoiceMessageProps {
  onSend?: (uri: string) => void; // callback when recording finishes
>>>>>>> bug-fixBranch
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [filePath, setFilePath] = useState<string | null>(null);
<<<<<<< HEAD
  const [hasPermission, setHasPermission] = useState(false);

  // Request microphone permission
  const requestPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone to record voice messages.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasPermission(true);
          return true;
        } else {
          Alert.alert('Permission Denied', 'Microphone permission is required to record voice messages.');
          return false;
        }
      } else {
        // iOS permissions are handled automatically
        setHasPermission(true);
        return true;
      }
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  useEffect(() => {
    requestPermission();
    return () => {
      // Cleanup
      if (isRecording) {
        audioRecorderPlayer.stopRecorder();
      }
      if (isPlaying) {
        audioRecorderPlayer.stopPlayer();
      }
    };
  }, []);
=======
>>>>>>> bug-fixBranch

  // 🎙️ Start recording
  const startRecording = async () => {
    try {
<<<<<<< HEAD
      if (!hasPermission) {
        const permissionGranted = await requestPermission();
        if (!permissionGranted) return;
      }

=======
>>>>>>> bug-fixBranch
      const uri = await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        return;
      });
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
<<<<<<< HEAD
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
=======
>>>>>>> bug-fixBranch
    }
  };

  // ⏹️ Stop recording
  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setFilePath(result);
<<<<<<< HEAD
      
      // Calculate duration in seconds
      const timeParts = recordTime.split(':');
      const minutes = parseInt(timeParts[0]) || 0;
      const seconds = parseInt(timeParts[1]) || 0;
      const totalSeconds = minutes * 60 + seconds;
      
      if (onSend) onSend(result, totalSeconds * 1000); // Convert to milliseconds
    } catch (err) {
      console.error('Stop error:', err);
      Alert.alert('Recording Error', 'Failed to stop recording.');
=======
      if (onSend) onSend(result);
    } catch (err) {
      console.error('Stop error:', err);
>>>>>>> bug-fixBranch
    }
  };

  // ▶️ Play recording
  const startPlay = async () => {
    if (!filePath) return;
<<<<<<< HEAD
    try {
      await audioRecorderPlayer.startPlayer(filePath);
      audioRecorderPlayer.addPlayBackListener((e) => {
        setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
        if (e.currentPosition >= e.duration) stopPlay();
        return;
      });
      setIsPlaying(true);
    } catch (err) {
      console.error('Play error:', err);
      Alert.alert('Playback Error', 'Failed to play recording.');
    }
=======
    await audioRecorderPlayer.startPlayer(filePath);
    audioRecorderPlayer.addPlayBackListener((e) => {
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
      if (e.currentPosition >= e.duration) stopPlay();
      return;
    });
    setIsPlaying(true);
>>>>>>> bug-fixBranch
  };

  // ⏸️ Stop playing
  const stopPlay = async () => {
<<<<<<< HEAD
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setIsPlaying(false);
    } catch (err) {
      console.error('Stop play error:', err);
    }
=======
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setIsPlaying(false);
>>>>>>> bug-fixBranch
  };

  // ⏩ Forward
  const seekForward = async () => {
<<<<<<< HEAD
    try {
      await audioRecorderPlayer.seekToPlayer(5000); // jump +5s
    } catch (err) {
      console.error('Seek forward error:', err);
    }
=======
    await audioRecorderPlayer.seekToPlayer(5000); // jump +5s
>>>>>>> bug-fixBranch
  };

  // ⏪ Backward
  const seekBackward = async () => {
<<<<<<< HEAD
    try {
      await audioRecorderPlayer.seekToPlayer(-5000); // jump -5s
    } catch (err) {
      console.error('Seek backward error:', err);
    }
=======
    await audioRecorderPlayer.seekToPlayer(-5000); // jump -5s
>>>>>>> bug-fixBranch
  };

  return (
    <View style={styles.container}>
      {/* RECORDING CONTROLS */}
      {!filePath ? (
        <View style={styles.recordSection}>
          <Text style={styles.timer}>{recordTime}</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: isRecording ? 'red' : 'green' }]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.btnText}>{isRecording ? 'Stop' : 'Record'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // PLAYBACK CONTROLS
        <View style={styles.playSection}>
          <Text style={styles.timer}>
            {playTime} / {duration}
          </Text>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.btnSmall} onPress={seekBackward}>
              <Text>-5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#555' }]}
              onPress={isPlaying ? stopPlay : startPlay}
            >
              <Text style={styles.btnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSmall} onPress={seekForward}>
              <Text>+5s</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default VoiceMessage;

const styles = StyleSheet.create({
  container: { alignItems: 'center', margin: 15 },
  recordSection: { alignItems: 'center' },
  playSection: { alignItems: 'center' },
  timer: { marginBottom: 10, fontSize: 16, fontWeight: '600' },
  controls: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  btn: {
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  btnSmall: {
    padding: 8,
    marginHorizontal: 8,
    backgroundColor: '#ddd',
    borderRadius: 6,
  },
});
