import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
} from "react-native";
import { useTheme } from '@react-navigation/native';
import ImageRenderer from './ImageRenderer';
import GifRenderer from './GifRenderer';
import VideoRenderer from './VideoRenderer';
import MediaPreviewModal from '../MediaPreviewModal/MediaPreviewModal';
import VoiceMessageBubble from '../VoiceMessageBubble';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';

interface MediaItem {
  uri: string;
  type: string; // e.g. "image/jpeg" | "video/mp4"
}

interface ChatBubbleProps {
  text?: string;
  media?: MediaItem[];
  isMine?: boolean;
  timestamp?: number;
  messageType?: string; // 'text' | 'gif' | 'sticker' | 'voice' | 'image' | 'video'
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
    senderName?: string;
  };
  onLongPress?: () => void;
  currentUserId?: string;
  testID?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadError?: string;
}

const formatTime = (timestamp?: number): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatBubble = ({
  text,
  media,
  isMine = false,
  timestamp,
  messageType = 'text',
  replyTo,
  onLongPress,
  currentUserId,
  testID,
  isUploading = false,
  uploadProgress,
  uploadError,
}: ChatBubbleProps) => {
  const { colors } = useTheme();

  // 🔥 State to handle preview modal
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const renderReplyContext = () => {
    if (!replyTo) return null;
    const isReplyToMe = replyTo.senderId === currentUserId;
    const replyAuthor = isReplyToMe ? "You" : replyTo.senderName || "Friend";

    return (
      <View
        style={[
          styles.replyContainer,
          { borderLeftColor: isMine ? "#ffffff80" : colors.primary },
        ]}
      >
        <Text
          style={[
            styles.replySender,
            { color: isMine ? "#ffffffcc" : colors.text + "cc" },
          ]}
        >
          {replyAuthor}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            styles.replyText,
            { color: isMine ? "#ffffff99" : colors.text + "99" },
          ]}
        >
          {replyTo.text}
        </Text>
      </View>
    );
  };

  const renderMedia = () => {
    // Show loading indicator if uploading
    if (isUploading && (!media || media.length === 0)) {
      const loadingType = messageType === 'voice' ? 'voice' : 
                         messageType === 'video' ? 'video' :
                         messageType === 'gif' ? 'image' : 'image';
      return (
        <LoadingIndicator 
          type={loadingType}
          progress={uploadProgress}
          size="medium"
          showText={true}
        />
      );
    }

    if (!media || media.length === 0) return null;

    // Separate media by type
    const images: MediaItem[] = [];
    const gifs: MediaItem[] = [];
    const videos: MediaItem[] = [];
    const audios: MediaItem[] = [];
    const unsupported: MediaItem[] = [];

    media.forEach((file) => {
      const mimeType = file?.type || "";
      const fileUri = file?.uri || "";
      
      // Enhanced GIF detection - check MIME type, messageType, and URI
      const isGif = mimeType === "image/gif" || 
                   messageType === "gif" ||
                   fileUri.toLowerCase().includes('.gif');
      const isImage = mimeType.startsWith("image") && !isGif;
      const isVideo = mimeType.startsWith("video");
      const isAudio = mimeType.startsWith("audio") || 
                     file.type === "audio" || 
                     messageType === "voice" ||
                     fileUri.toLowerCase().includes('.m4a') ||
                     fileUri.toLowerCase().includes('.wav') ||
                     fileUri.toLowerCase().includes('.mp3') ||
                     fileUri.toLowerCase().includes('.aac');

      if (isGif) {
        gifs.push(file);
      } else if (isImage) {
        images.push(file);
      } else if (isVideo) {
        videos.push(file);
      } else if (isAudio) {
        audios.push(file);
      } else {
        unsupported.push(file);
      }
    });

    return (
      <View style={styles.mediaContainer}>
        {/* Show loading overlay if still uploading */}
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <LoadingIndicator 
              type={messageType === 'voice' ? 'voice' : 'image'}
              progress={uploadProgress}
              size="small"
              showText={false}
            />
          </View>
        )}
        
        {/* Render GIFs */}
        {gifs.length > 0 && (
          <GifRenderer media={gifs} onPreview={setPreviewMedia} />
        )}
        
        {/* Render Images */}
        {images.length > 0 && (
          <ImageRenderer media={images} onPreview={setPreviewMedia} />
        )}
        
        {/* Render Videos */}
        {videos.length > 0 && (
          <VideoRenderer media={videos} onPreview={setPreviewMedia} />
        )}
        
        {/* Render Audio */}
        {audios.map((file, index) => (
          <VoiceMessageBubble
            key={index}
            audioUri={file.uri}
            isMine={isMine}
          />
        ))}
        
        {/* Render Unsupported */}
        {unsupported.map((file, index) => (
          <Text key={index} style={styles.unsupportedText}>
            Unsupported file
          </Text>
        ))}
      </View>
    );
  };

  const renderSticker = () => {
    if (messageType !== 'sticker' || !text) return null;
    
    return (
      <View style={styles.stickerContainer}>
        <Text style={styles.stickerText}>{text}</Text>
      </View>
    );
  };

  if(messageType === 'gif'){
  console.log("Message type", messageType)
  }
  return (
    <>
      <View
        testID={testID || "chat-bubble"}
        style={[
          styles.messageRow,
          isMine ? styles.myMessageRow : styles.theirMessageRow,
        ]}
      >
        {/* Render different message types with appropriate styling */}
        {messageType === 'voice' ? (
          // Voice messages - special styling for voice bubbles
          <Pressable 
            style={styles.voiceMessageContainer}
            onLongPress={onLongPress}
            delayLongPress={500}
          >
            {renderReplyContext()}
            {renderMedia()}
            {timestamp && (
              <Text style={[styles.timestamp, { color: isMine ? "#fff" : colors.text, opacity: 0.7 }]}>
                {formatTime(timestamp)}
              </Text>
            )}
          </Pressable>
        ) : messageType === 'gif' ? (
          // GIF messages - transparent background, no text, only GIF
          <Pressable 
            style={styles.gifMessageContainer}
            onLongPress={onLongPress}
            delayLongPress={500}
          >
            {renderReplyContext()}
            {renderMedia()}
            {timestamp && (
              <Text style={[styles.timestampOverlay, { color: 'black' }]}>
                {formatTime(timestamp)}
              </Text>
            )}
          </Pressable>
        ) : messageType === 'sticker' ? (
          // Sticker messages - transparent background
          <Pressable
            style={styles.stickerBubble}
            onLongPress={onLongPress}
            delayLongPress={500}
          >
            {renderReplyContext()}
            {renderSticker()}
          </Pressable>
        ) : (
          // Regular messages with text and/or media
          <Pressable
            style={[
              styles.bubble,
              // Show background for text, semi-transparent for media with text
              (media && media.length > 0 && text) ? 
                (isMine 
                  ? { backgroundColor: 'rgba(129, 140, 248, 0.9)', borderBottomRightRadius: 4 }
                  : { backgroundColor: 'rgba(255, 255, 255, 0.9)', borderBottomLeftRadius: 4 }
                ) :
              (media && media.length > 0) ? { backgroundColor: 'transparent' } :
              isMine
                ? { backgroundColor: '#818CF8', borderBottomRightRadius: 4 }
                : { backgroundColor: colors.card, borderBottomLeftRadius: 4 },
            ]}
            onLongPress={onLongPress}
            delayLongPress={500}
          >
            
            {renderReplyContext()}

            {/* Media content */}
            {renderMedia()}

            {/* Error display */}
            {uploadError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Upload failed: {uploadError}
                </Text>
              </View>
            )}

            {/* Text content - show for all messages except pure GIFs */}
            {text && messageType !== "gif" && (
              <View style={[
                styles.textContainer,
                (media && media.length > 0) && styles.textOverMedia
              ]}>
                <Text
                  style={[
                    styles.messageText,
                    { color: isMine ? "#fff" : colors.text },
                    (media && media.length > 0) && styles.textWithShadow
                  ]}
                >
                  {text}
                </Text>
              </View>
            )}

            {/* Timestamp */}
            {timestamp && !(media && media.length > 0 && media[0].type?.startsWith("audio")) && (
              <Text
                style={[
                  styles.timestamp,
                  { color: isMine ? "#fff" : colors.text, opacity: 0.7 },
                ]}
              >
                {formatTime(timestamp)}
              </Text>
            )}
          </Pressable>
        )}
      </View>

      {/* Media Preview Modal */}
      <MediaPreviewModal
        visible={!!previewMedia}
        mediaItem={previewMedia}
        onClose={() => setPreviewMedia(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  messageRow: { marginVertical: 3, paddingHorizontal: 4 },
  myMessageRow: { alignItems: "flex-end" },
  theirMessageRow: { alignItems: "flex-start" , },
  bubble: { padding: 12, borderRadius: 16, maxWidth: "80%", minWidth: 60, },
  messageText: { fontSize: 16, lineHeight: 20, marginBottom: 6, alignItems:"flex-start" },
  timestamp: { fontSize: 11, marginTop: 4, textAlign: "right" },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 8,
    opacity: 0.9,
  },
  replySender: { fontSize: 14, fontWeight: "600" },
  replyText: { fontSize: 13, marginTop: 2, opacity: 0.8 },
  mediaContainer: { 
    marginTop: 8, 
    gap: 8,
  },
  stickerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stickerText: {
    fontSize: 48,
    lineHeight: 56,
  },
  stickerBubble: {
    backgroundColor: 'transparent',
    padding: 8,
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
  },
  unsupportedText: {
    color: 'red',
    fontStyle: 'italic',
    padding: 8,
  },
  textContainer: {
    marginTop: 8,
  },
  textOverMedia: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 5,
  },
  textWithShadow: {
    //textShadowColor: 'rgba(0, 0, 0, 0.8)',
    //textShadowOffset: { width: 1, height: 1 },
    //textShadowRadius: 2,
    color: '#fff',
  },
  gifMessageContainer: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  voiceMessageContainer: {
    backgroundColor: 'transparent',
  },
  mediaBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  videoLabel: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },

  // 🔥 Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseArea: {
    ...StyleSheet.absoluteFillObject,
  },
  fullImage: { width: "100%", height: "100%" },
  fullVideo: { width: "100%", height: "100%" },
  uploadingOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
    zIndex: 10,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    margin: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ChatBubble;
