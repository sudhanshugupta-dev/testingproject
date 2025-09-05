import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../themes/useTheme';

interface VoiceMessageBubbleProps {
  audioUri: string;
  duration?: number;
  isMine?: boolean;
}

const VoiceMessageBubble: React.FC<VoiceMessageBubbleProps> = ({
  audioUri,
  duration,
  isMine = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const audioRecorderPlayer = AudioRecorderPlayer;
  
  const { colors } = useAppTheme();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [audioRecorderPlayer]);

  const playAudio = async () => {
    try {
      if (isPlaying) {
        await audioRecorderPlayer.pausePlayer();
        setIsPlaying(false);
      } else {
        await audioRecorderPlayer.startPlayer(audioUri);
        setIsPlaying(true);

        audioRecorderPlayer.addPlayBackListener((e: any) => {
          setCurrentTime(e.currentPosition);
          setTotalDuration(e.duration);

          if (e.currentPosition >= e.duration) {
            setIsPlaying(false);
            setCurrentTime(0);
            audioRecorderPlayer.stopPlayer();
            audioRecorderPlayer.removePlayBackListener();
          }
        });
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <View style={[
      styles.container,
      { backgroundColor: isMine ? colors.primary : colors.card }
    ]}>
      <TouchableOpacity
        style={[
          styles.playButton,
          { backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : colors.primary }
        ]}
        onPress={playAudio}
      >
        <Icon
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color={isMine ? '#fff' : '#fff'}
        />
      </TouchableOpacity>

      <View style={styles.waveformContainer}>
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${progress}%`,
                backgroundColor: isMine ? 'rgba(255,255,255,0.8)' : colors.primary
              }
            ]}
          />
          <View style={[
            styles.progressBackground,
            { backgroundColor: isMine ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }
          ]} />
        </View>
        
        <Text style={[
          styles.timeText,
          { color: isMine ? '#fff' : colors.text }
        ]}>
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </Text>
      </View>

      <Icon
        name="mic"
        size={16}
        color={isMine ? 'rgba(255,255,255,0.7)' : colors.text + '70'}
        style={styles.micIcon}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    minWidth: 200,
    maxWidth: 280,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  waveformContainer: {
    flex: 1,
    marginRight: 8,
  },
  progressContainer: {
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
    position: 'relative',
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  micIcon: {
    marginLeft: 4,
  },
});

export default VoiceMessageBubble;
