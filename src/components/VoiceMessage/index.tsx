// VoiceMessage.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = AudioRecorderPlayer; // ✅ no "new"

interface VoiceMessageProps {
  onSend?: (uri: string) => void; // callback when recording finishes
}

const VoiceMessage: React.FC<VoiceMessageProps> = ({ onSend }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState('00:00');
  const [playTime, setPlayTime] = useState('00:00');
  const [duration, setDuration] = useState('00:00');
  const [filePath, setFilePath] = useState<string | null>(null);

  // 🎙️ Start recording
  const startRecording = async () => {
    try {
      const uri = await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        return;
      });
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  // ⏹️ Stop recording
  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      setFilePath(result);
      if (onSend) onSend(result);
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  // ▶️ Play recording
  const startPlay = async () => {
    if (!filePath) return;
    await audioRecorderPlayer.startPlayer(filePath);
    audioRecorderPlayer.addPlayBackListener((e) => {
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
      setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
      if (e.currentPosition >= e.duration) stopPlay();
      return;
    });
    setIsPlaying(true);
  };

  // ⏸️ Stop playing
  const stopPlay = async () => {
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
    setIsPlaying(false);
  };

  // ⏩ Forward
  const seekForward = async () => {
    await audioRecorderPlayer.seekToPlayer(5000); // jump +5s
  };

  // ⏪ Backward
  const seekBackward = async () => {
    await audioRecorderPlayer.seekToPlayer(-5000); // jump -5s
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
