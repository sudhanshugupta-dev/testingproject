// // VoiceMessage.tsx
// import React, { useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid } from 'react-native';
// import AudioRecorderPlayer from 'react-native-audio-recorder-player';

// const audioRecorderPlayer = AudioRecorderPlayer; // ✅ instance

// interface VoiceMessageProps {
//   onSend?: (uri: string) => void;
// }

// const VoiceMessage: React.FC<VoiceMessageProps> = ({ onSend }) => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [recordTime, setRecordTime] = useState('00:00');
//   const [playTime, setPlayTime] = useState('00:00');
//   const [duration, setDuration] = useState('00:00');
//   const [filePath, setFilePath] = useState<string | null>(null);

//   async function requestPermissions() {
//     console.log('Requesting mic permissions...');
//     const granted = await PermissionsAndroid.request(
//       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//       {
//         title: 'Microphone Permission',
//         message: 'App needs access to your microphone to record audio',
//         buttonPositive: 'OK',
//       }
//     );

//     console.log('Permission result:', granted);
//     return granted === PermissionsAndroid.RESULTS.GRANTED;
//   }

//   // 🎙️ Start recording
//   const startRecording = async () => {
//     console.log('Start recording pressed');
//     const hasPermission = await requestPermissions();
//     if (!hasPermission) {
//       console.warn('No mic permission');
//       return;
//     }

//     try {
//       const uri = await audioRecorderPlayer.startRecorder();
//       console.log('Recording started, file path:', uri);

//       audioRecorderPlayer.addRecordBackListener((e) => {
//         const time = audioRecorderPlayer.mmssss(Math.floor(e.currentPosition));
//         console.log('Recording progress:', time);
//         setRecordTime(time);
//         return;
//       });
//       setIsRecording(true);
//     } catch (err) {
//       console.error('Recording error:', err);
//     }
//   };

//   // ⏹️ Stop recording
//   const stopRecording = async () => {
//     console.log('Stop recording pressed');
//     try {
//       const result = await audioRecorderPlayer.stopRecorder();
//       console.log('Recording stopped, result path:', result);

//       audioRecorderPlayer.removeRecordBackListener();
//       setIsRecording(false);
//       setFilePath(result);

//       if (onSend) {
//         console.log('Calling onSend callback with result:', result);
//         onSend(result);
//       }
//     } catch (err) {
//       console.error('Stop error:', err);
//     }
//   };

//   // ▶️ Play recording
//   const startPlay = async () => {
//     console.log('Play pressed');
//     if (!filePath) {
//       console.warn('No file to play');
//       return;
//     }

//     await audioRecorderPlayer.startPlayer(filePath);
//     console.log('Playback started for:', filePath);

//     audioRecorderPlayer.addPlayBackListener((e) => {
//       const cur = audioRecorderPlayer.mmssss(Math.floor(e.currentPosition));
//       const dur = audioRecorderPlayer.mmssss(Math.floor(e.duration));
//       console.log('Playing... current:', cur, ' duration:', dur);

//       setPlayTime(cur);
//       setDuration(dur);

//       if (e.currentPosition >= e.duration) {
//         console.log('Playback finished');
//         stopPlay();
//       }
//       return;
//     });
//     setIsPlaying(true);
//   };

//   // ⏸️ Stop playing
//   const stopPlay = async () => {
//     console.log('Stop playback pressed');
//     await audioRecorderPlayer.stopPlayer();
//     audioRecorderPlayer.removePlayBackListener();
//     setIsPlaying(false);
//   };

//   // ⏩ Forward
//   const seekForward = async () => {
//     console.log('Seek forward +5s');
//     await audioRecorderPlayer.seekToPlayer(5000);
//   };

//   // ⏪ Backward
//   const seekBackward = async () => {
//     console.log('Seek backward -5s');
//     await audioRecorderPlayer.seekToPlayer(-5000);
//   };

//   return (
//     <View style={styles.container}>
//       {!filePath ? (
//         <View style={styles.recordSection}>
//           <Text style={styles.timer}>{recordTime}</Text>
//           <TouchableOpacity
//             style={[styles.btn, { backgroundColor: isRecording ? 'red' : 'green' }]}
//             onPress={isRecording ? stopRecording : startRecording}
//           >
//             <Text style={styles.btnText}>{isRecording ? 'Stop' : 'Record'}</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.playSection}>
//           <Text style={styles.timer}>
//             {playTime} / {duration}
//           </Text>
//           <View style={styles.controls}>
//             <TouchableOpacity style={styles.btnSmall} onPress={seekBackward}>
//               <Text>-5s</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.btn, { backgroundColor: '#555' }]}
//               onPress={isPlaying ? stopPlay : startPlay}
//             >
//               <Text style={styles.btnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.btnSmall} onPress={seekForward}>
//               <Text>+5s</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// export default VoiceMessage;

// const styles = StyleSheet.create({
//   container: { alignItems: 'center', margin: 15 },
//   recordSection: { alignItems: 'center' },
//   playSection: { alignItems: 'center' },
//   timer: { marginBottom: 10, fontSize: 16, fontWeight: '600' },
//   controls: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
//   btn: {
//     padding: 12,
//     borderRadius: 8,
//     minWidth: 80,
//     alignItems: 'center',
//   },
//   btnText: { color: '#fff', fontWeight: 'bold' },
//   btnSmall: {
//     padding: 8,
//     marginHorizontal: 8,
//     backgroundColor: '#ddd',
//     borderRadius: 6,
//   },
// });

// VoiceMessage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  PermissionsAndroid, 
  Platform,
  Alert 
} from 'react-native';

// Import the library correctly - check if it's a default or named export
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

interface VoiceMessageProps {
  onSend?: (uri: string) => void;
  onCancel?: () => void;
  autoStart?: boolean;
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ onSend, onCancel, autoStart = false }) => {
  // Create a ref for the audio recorder player instance
  const audioRecorderPlayerRef = useRef<any>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [currentPos, setCurrentPos] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);

  // Initialize the audio recorder player
  useEffect(() => {
    // Check if the library is a constructor or has a default export
    if (typeof AudioRecorderPlayer === 'function') {
      audioRecorderPlayerRef.current = new AudioRecorderPlayer();
    } else if (AudioRecorderPlayer && typeof AudioRecorderPlayer.default === 'function') {
      // Some libraries export as { default: class }
      audioRecorderPlayerRef.current = new AudioRecorderPlayer.default();
    } else {
      // If it's not a constructor, use it directly
      audioRecorderPlayerRef.current = AudioRecorderPlayer;
    }
    
    requestPermissions();
    
    // Cleanup on unmount
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (isPlaying) {
        stopPlay();
      }
    };
  }, []);

  async function requestPermissions() {
    console.log('Requesting permissions...');
    
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        console.log('Permission result:', grants);

        const allGranted = 
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED;

        setHasPermission(allGranted);
        
        if (!allGranted) {
          Alert.alert(
            'Permissions Required',
            'This app needs microphone and storage permissions to record and send voice messages.',
            [{ text: 'OK' }]
          );
        }
        
        return allGranted;
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    
    // For iOS, permissions are handled through Info.plist
    setHasPermission(true);
    return true;
  }

  // 🎙️ Start recording
  const startRecording = async () => {
    console.log('Start recording pressed');
    
    if (!hasPermission) {
      const granted = await requestPermissions();
      if (!granted) {
        console.warn('Permissions not granted for audio recording');
        Alert.alert(
          'Permission Denied',
          'Cannot record audio without the required permissions.'
        );
        return;
      }
    }

    try {
      const uri = await audioRecorderPlayerRef.current.startRecorder();
      console.log('Recording started, file path:', uri);
      setFilePath(uri);
      
      audioRecorderPlayerRef.current.addRecordBackListener((e: any) => {
        const time = audioRecorderPlayerRef.current.mmssss(Math.floor(e.currentPosition));
        console.log('Recording progress:', time);
        setRecordTime(time);
        setCurrentPos(e.currentPosition);
      });
      
      setIsRecording(true);
    } catch (err) {
      console.error('Recording start error:', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  // ⏹️ Stop recording
  const stopRecording = async () => {
    console.log('Stop recording pressed');
    try {
      const result = await audioRecorderPlayerRef.current.stopRecorder();
      console.log('Recording stopped, final file path:', result);
      audioRecorderPlayerRef.current.removeRecordBackListener();
      setIsRecording(false);
      setFilePath(result);
    } catch (err) {
      console.error('Stop recording error:', err);
    }
  };

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ▶️ Play recording
  const startPlay = async () => {
    console.log('Play pressed');
    if (!filePath) {
      console.warn('No file to play');
      return;
    }

    try {
      await audioRecorderPlayerRef.current.startPlayer(filePath);
      console.log('Playback started for:', filePath);

      audioRecorderPlayerRef.current.addPlayBackListener((e: any) => {
        const cur = audioRecorderPlayerRef.current.mmssss(Math.floor(e.currentPosition));
        const dur = audioRecorderPlayerRef.current.mmssss(Math.floor(e.duration));
        console.log('Playing... current:', cur, ' duration:', dur);

        setPlayTime(cur);
        setDuration(dur);
        setCurrentPos(e.currentPosition);

        if (e.currentPosition >= e.duration) {
          console.log('Playback finished');
          stopPlay();
        }
      });
      
      setIsPlaying(true);
    } catch (err) {
      console.error('Playback error:', err);
      Alert.alert('Error', 'Failed to play recording');
    }
  };

  // ⏸️ Stop playing
  const stopPlay = async () => {
    console.log('Stop playback pressed');
    try {
      await audioRecorderPlayerRef.current.stopPlayer();
      audioRecorderPlayerRef.current.removePlayBackListener();
      setIsPlaying(false);
      setPlayTime('00:00');
    } catch (err) {
      console.error('Stop playback error:', err);
    }
  };

  // Toggle playback
  const togglePlayback = () => {
    if (isPlaying) {
      stopPlay();
    } else {
      startPlay();
    }
  };

  // ⏩ Forward
  const seekForward = async () => {
    console.log('Seek forward +5s');
    try {
      await audioRecorderPlayerRef.current.seekToPlayer(currentPos + 5000);
    } catch (err) {
      console.error('Seek forward error:', err);
    }
  };

  // ⏪ Backward
  const seekBackward = async () => {
    console.log('Seek backward -5s');
    try {
      await audioRecorderPlayerRef.current.seekToPlayer(Math.max(0, currentPos - 5000));
    } catch (err) {
      console.error('Seek backward error:', err);
    }
  };

  // Send the recording
  const handleSend = () => {
    if (filePath && onSend) {
      console.log("Sending file:", filePath);
      onSend(filePath);
      resetState();
    }
  };

  // Re-record
  const handleRerecord = () => {
    if (isPlaying) {
      stopPlay();
    }
    resetState();
    startRecording();
  };

  // Reset component state
  const resetState = () => {
    setFilePath(null);
    setIsPlaying(false);
    setRecordTime('00:00');
    setPlayTime('00:00');
    setDuration('00:00');
    setCurrentPos(0);
  };

  // Cancel
  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    } else if (isPlaying) {
      stopPlay();
    }
    resetState();
    if (onCancel) {
      onCancel();
    }
  };

  // Auto-start recording if prop is set
  useEffect(() => {
    if (autoStart && hasPermission) {
      startRecording();
    }
  }, [autoStart, hasPermission]);

  return (
    <View style={styles.container}>
      {!filePath ? (
        <View style={styles.recordSection}>
          <Text style={styles.timer}>{recordTime}</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: isRecording ? 'red' : 'green' }]}
            onPress={toggleRecording}
            disabled={!hasPermission}
          >
            <Text style={styles.btnText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={handleCancel}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
          
          {!hasPermission && (
            <Text style={styles.permissionText}>
              Microphone permission is required to record audio
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.playSection}>
          <Text style={styles.timer}>
            {playTime} / {duration}
          </Text>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.btnSmall} onPress={seekBackward}>
              <Text style={styles.btnSmallText}>-5s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#555' }]}
              onPress={togglePlayback}
            >
              <Text style={styles.btnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSmall} onPress={seekForward}>
              <Text style={styles.btnSmallText}>+5s</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.btnSend} onPress={handleSend}>
              <Text style={styles.btnText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnRerecord} onPress={handleRerecord}>
              <Text style={styles.btnText}>Re-record</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnCancel} onPress={handleCancel}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default VoiceMessage;

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    margin: 15, 
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
  },
  recordSection: { 
    alignItems: 'center',
    width: '100%',
  },
  playSection: { 
    alignItems: 'center',
    width: '100%',
  },
  timer: { 
    marginBottom: 20, 
    fontSize: 24, 
    fontWeight: '600',
    color: '#333',
  },
  controls: { 
    flexDirection: 'row', 
    marginTop: 20, 
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btnText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  btnSmall: {
    padding: 10,
    marginHorizontal: 8,
    backgroundColor: '#ddd',
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  btnSmallText: {
    fontWeight: 'bold',
    color: '#333',
  },
  btnCancel: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: '#6c757d',
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  btnSend: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  btnRerecord: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fd7e14',
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  permissionText: {
    marginTop: 15,
    color: '#dc3545',
    textAlign: 'center',
    fontSize: 14,
  },
});