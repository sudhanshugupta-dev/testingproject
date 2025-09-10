import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Sound from 'react-native-nitro-sound';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';

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
  
  const { colors } = useTheme();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      try {
        Sound.stopPlayer();
        Sound.removePlayBackListener();
      } catch (e) {
        console.log('🎤 VoiceMessageBubble cleanup error:', e);
      }
    };
  }, []);

  const playAudio = async () => {
    try {
      if (isPlaying) {
        await Sound.pausePlayer();
        setIsPlaying(false);
      } else {
        console.log('🎤 VoiceMessageBubble: Starting playback for:', audioUri);
        
        // Set up playback progress listener
        Sound.addPlayBackListener((e: any) => {
          console.log('🎤 VoiceMessageBubble: Playback progress:', e.currentPosition, e.duration);
          setCurrentTime(e.currentPosition);
          setTotalDuration(e.duration);

          if (e.currentPosition >= e.duration) {
            console.log('🎤 VoiceMessageBubble: Playback finished');
            setIsPlaying(false);
            setCurrentTime(0);
            Sound.stopPlayer();
            Sound.removePlayBackListener();
          }
        });
        
        await Sound.startPlayer(audioUri);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('🎤 VoiceMessageBubble: Error playing audio:', error);
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
      { backgroundColor: isMine ?  'rgba(129, 140, 248, 0.9)' : colors.card }
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
