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
      const isAudio = mimeType.startsWith("audio") || file.type === "audio";

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
          <Text key={index} style={styles.unsupportedText}>
            Audio file
          </Text>
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
        {messageType === 'gif' ? (
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
              // Show primary colors for text messages, transparent for media
              (media && media.length > 0) ? { backgroundColor: 'transparent' } :
              isMine
                ? { backgroundColor: '#818CF8', borderBottomRightRadius: 4 }
                : { backgroundColor: colors.card, borderBottomLeftRadius: 4 },
            ]}
            onLongPress={onLongPress}
            delayLongPress={500}
          >
            
            {renderReplyContext()}

           

            {/* Media content below text */}
            {renderMedia()}

            {/* Text content - only show for non-GIF messages */}
            
            {messageType != "gif" || (messageType != "gif" && text) ? (
             <Text
               style={[
                    styles.messageText,
                    { color: isMine ? "#fff" : colors.text },
                ]}
               >
                 {text}
            </Text>
             ) : null}

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
  gifMessageContainer: {
    position: 'relative',
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
});

export default ChatBubble;
