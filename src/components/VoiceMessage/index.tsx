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
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

interface VoiceMessageProps {
  onSend?: (uri: string) => void;
  onCancel?: () => void;
  autoStart?: boolean;
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ onSend, onCancel, autoStart = false }) => {
  const audioRecorderPlayer = AudioRecorderPlayer;

  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [filePath, setFilePath] = useState<string | null>(null);
  const [currentPos, setCurrentPos] = useState(0);

  async function requestPermissions() {
    console.log('Requesting permissions...');
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      ];
      const result = await PermissionsAndroid.requestMultiple(permissions);
      const allGranted = Object.values(result).every(r => r === PermissionsAndroid.RESULTS.GRANTED);
      console.log('Permission result:', result);
      return allGranted;
    }
    return true; // iOS permissions handled in Info.plist
  }

 // 🎙️ Start recording
  const startRecording = async () => {
    console.log('Start recording pressed');
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('Permissions not granted for audio recording');
      return;
    }

    try {
      const uri = await audioRecorderPlayer.startRecorder();
      console.log('Recording started, temporary file path:', uri);
      // Note: Not storing uri in state yet, as file is incomplete until stopRecording
      audioRecorderPlayer.addRecordBackListener((e: { currentPosition: number }) => {
        const time = audioRecorderPlayer.mmssss(Math.floor(e.currentPosition));
        console.log('Recording progress:', { time, position: e.currentPosition });
        setRecordTime(time);
      });
      setIsRecording(true);
    } catch (err) {
      console.error('Recording start error:', err);
    }
  };

  // ⏹️ Stop recording
  const stopRecording = async () => {
    console.log('Stop recording pressed');
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      console.log('Recording stopped, final file path:', result);
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setFilePath(result); // Store file path only after recording is complete
    } catch (err) {
      console.error('Stop recording error:', err);
    }
  };
  // ▶️ Play recording
  const startPlay = async () => {
    console.log('Play pressed');
    if (!filePath) {
      console.warn('No file to play');
      return;
    }

    await audioRecorderPlayer.startPlayer(filePath);
    console.log('Playback started for:', filePath);

    audioRecorderPlayer.addPlayBackListener((e) => {
      const cur = audioRecorderPlayer.mmssss(Math.floor(e.currentPosition));
      const dur = audioRecorderPlayer.mmssss(Math.floor(e.duration));
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
  };

  // ⏸️ Stop playing
  const stopPlay = async () => {
    console.log('Stop playback pressed');
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setIsPlaying(false);
    setPlayTime('00:00');
  };

  // ⏩ Forward
  const seekForward = async () => {
    console.log('Seek forward +5s');
    await audioRecorderPlayer.seekToPlayer(currentPos + 5000);
  };

  // ⏪ Backward
  const seekBackward = async () => {
    console.log('Seek backward -5s');
    await audioRecorderPlayer.seekToPlayer(Math.max(0, currentPos - 5000));
  };

  // Send the recording
  const handleSend = () => {
    if (filePath && onSend) {
      console.log("redhate", filePath)
      onSend(filePath);
    }
  };

  // Re-record
  const handleRerecord = () => {
    stopPlay();
    setFilePath(null);
    setIsPlaying(false);
    setRecordTime('00:00');
    setPlayTime('00:00');
    setDuration('00:00');
    setCurrentPos(0);
    startRecording();
  };

  // Cancel
  const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    } else if (isPlaying) {
      stopPlay();
    }
    setFilePath(null);
    setIsRecording(false);
    setIsPlaying(false);
    setRecordTime('00:00');
    setPlayTime('00:00');
    setDuration('00:00');
    setCurrentPos(0);
    if (onCancel) {
      onCancel();
    }
  };

  useEffect(() => {
    if (autoStart) {
      startRecording();
    }
  }, [autoStart]);

  return (
    <View style={styles.container}>
      {!filePath ? (
        <View style={styles.recordSection}>
          <Text style={styles.timer}>{recordTime}</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: isRecording ? 'red' : 'green' }]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Text style={styles.btnText}>{isRecording ? 'Stop' : 'Record'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancel} onPress={handleCancel}>
            <Text style={styles.btnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
  container: { alignItems: 'center', margin: 15, flex: 1 },
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
  btnCancel: {
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    backgroundColor: 'gray',
    marginTop: 10,
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
    backgroundColor: 'blue',
    alignItems: 'center',
  },
  btnRerecord: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'orange',
    alignItems: 'center',
  },
});