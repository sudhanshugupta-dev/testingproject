// import React from "react";
// import { View, Text, StyleSheet, Pressable, Image } from "react-native";
// import { useAppTheme } from "../../themes/useTheme";
// import { useTranslation } from "react-i18next";
// import Video from "react-native-video";

// interface MediaItem {
//   uri: string;
//   type: string; // e.g. "image/jpeg" | "video/mp4"
// }

// interface ChatBubbleProps {
//   text?: string;
//   media?: MediaItem[];
//   isMine?: boolean;
//   timestamp?: number;
//   replyTo?: {
//     messageId: string;
//     text: string;
//     senderId: string;
//     senderName?: string;
//   };
//   onLongPress?: () => void;
//   currentUserId?: string;
// }

// const formatTime = (timestamp?: number): string => {
//   if (!timestamp) return "";
//   const date = new Date(timestamp);
//   return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// };

// const ChatBubble = ({
//   text,
//   media,
//   isMine = false,
//   timestamp,
//   replyTo,
//   onLongPress,
//   currentUserId,
// }: ChatBubbleProps) => {
//   const { colors } = useAppTheme();
//   const { t } = useTranslation();

//   //console.log("check media", media, timestamp)

//   const renderReplyContext = () => {
//     if (!replyTo) return null;
//     const isReplyToMe = replyTo.senderId === currentUserId;
//     const replyAuthor = isReplyToMe ? t("chat.you") : replyTo.senderName || t("chat.friend");

    
//     return (
//       <View
//         style={[
//           styles.replyContainer,
//           { borderLeftColor: isMine ? "#ffffff80" : colors.primary },
//         ]}
//       >
//         <Text
//           style={[
//             styles.replySender,
//             { color: isMine ? "#ffffffcc" : colors.text + "cc" },
//           ]}
//         >
//           {replyAuthor}
//         </Text>
//         <Text
//           numberOfLines={1}
//           style={[
//             styles.replyText,
//             { color: isMine ? "#ffffff99" : colors.text + "99" },
//           ]}
//         >
//           {replyTo.text}
//         </Text>
//       </View>
//     );
//   };

//   const renderMedia = () => {
//     if (!media || media.length === 0) return null;

//     return (
//       <View style={styles.mediaContainer}>
//         {media.map((file, index) => {
//           const mimeType = file?.type || "";
//           const isImage = mimeType.startsWith("image");
//           const isVideo = mimeType.startsWith("video");

//           if (isImage) {
//             return (
//               <Image
//                 key={index}
//                 source={{ uri: file.uri }}
//                 style={styles.mediaImage}
//                 resizeMode="cover"
//               />
//             );
//           }

//           if (isVideo) {
//             return (
//               <Video
//                 key={index}
//                 source={{ uri: file.uri }}
//                 style={styles.mediaVideo}
//                 controls
//                 paused
//                 resizeMode="cover"
//               />
//             );
//           }

//           return (
//             <Text key={index} style={{ color: "red" }}>
//               Unsupported file
//             </Text>
//           );
//         })}
//       </View>
//     );
//   };

//   return (
//     <View
//       style={[
//         styles.messageRow,
//         isMine ? styles.myMessageRow : styles.theirMessageRow,
//       ]}
//     >
//       <Pressable
//         style={[
//           styles.bubble,
//           isMine
//             ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
//             : { backgroundColor: colors.card, borderBottomLeftRadius: 4 },
//         ]}
//         onLongPress={onLongPress}
//         delayLongPress={500}
//       >
//         {renderReplyContext()}

//         {text ? (
//           <Text
//             style={[
//               styles.messageText,
//               { color: isMine ? "#fff" : colors.text },
//             ]}
//           >
//             {text}
//           </Text>
//         ) : null}

//         {renderMedia()}

//         {timestamp && (
//           <Text
//             style={[
//               styles.timestamp,
//               { color: isMine ? "#fff" : colors.text, opacity: 0.7 },
//             ]}
//           >
//             {formatTime(timestamp)}
//           </Text>
//         )}
//       </Pressable>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   messageRow: { marginVertical: 3, paddingHorizontal: 4 },
//   myMessageRow: { alignItems: "flex-end" },
//   theirMessageRow: { alignItems: "flex-start" },
//   bubble: { padding: 12, borderRadius: 16, maxWidth: "80%", minWidth: 60 },
//   messageText: { fontSize: 16, lineHeight: 20, marginBottom: 6 },
//   timestamp: { fontSize: 11, marginTop: 4, textAlign: "right" },
//   replyContainer: {
//     borderLeftWidth: 3,
//     paddingLeft: 8,
//     marginBottom: 8,
//     opacity: 0.9,
//   },
//   replySender: { fontSize: 14, fontWeight: "600" },
//   replyText: { fontSize: 13, marginTop: 2, opacity: 0.8 },
//   mediaContainer: { marginTop: 6, gap: 8 },
//   mediaImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
//   mediaVideo: { width: 220, height: 220, borderRadius: 12, marginBottom: 8 },
// });

// export default ChatBubble;


import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useAppTheme } from "../../themes/useTheme";
import { useTranslation } from "react-i18next";
import Video from "react-native-video";
import ImageRenderer from "./ImageRenderer";
import VideoRenderer from "./VideoRenderer";
import GifRenderer from "./GifRenderer";
import LoadingIndicator from "../LoadingIndicator/LoadingIndicator";
import VoiceMessageBubble from "../VoiceMessageBubble";

interface MediaItem {
  uri: string;
  type: string; // e.g. "image/jpeg" | "video/mp4"
}

interface ChatBubbleProps {
  text?: string;
  media?: MediaItem[];
  isMine?: boolean;
  timestamp?: number;
  replyTo?: {
    messageId: string;
    text: string;
    senderId: string;
    senderName?: string;
  };
  onLongPress?: () => void;
  currentUserId?: string;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadError?: string;
  messageType?: 'text' | 'voice' | 'sticker' | 'media';
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
  replyTo,
  onLongPress,
  currentUserId,
  isUploading,
  uploadProgress,
  uploadError,
  messageType = 'text',
  testID = 'chat-bubble',
}: ChatBubbleProps) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  // 🔥 State to handle preview modal
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const renderReplyContext = () => {
    if (!replyTo) return null;
    const isReplyToMe = replyTo.senderId === currentUserId;
    const replyAuthor = isReplyToMe ? t("chat.you") : replyTo.senderName || t("chat.friend");

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

    const imageItems = media.filter(m => (m.type || '').startsWith('image') && !(m.type || '').includes('gif'));
    const gifItems = media.filter(m => (m.type || '').includes('gif'));
    const videoItems = media.filter(m => (m.type || '').startsWith('video'));

    return (
      <View style={styles.mediaContainer}>
        {imageItems.length > 0 && (
          <ImageRenderer media={imageItems as any} onPreview={setPreviewMedia as any} />
        )}
        {gifItems.length > 0 && (
          <GifRenderer media={gifItems as any} onPreview={setPreviewMedia as any} />
        )}
        {videoItems.length > 0 && (
          <VideoRenderer media={videoItems as any} onPreview={setPreviewMedia as any} />
        )}
        {imageItems.length === 0 && gifItems.length === 0 && videoItems.length === 0 && (
          <Text style={{ color: 'red' }}>Unsupported file</Text>
        )}
      </View>
    );
  };

  return (
    <>
      <View
        style={[
          styles.messageRow,
          isMine ? styles.myMessageRow : styles.theirMessageRow,
        ]}
      >
        <Pressable
          style={[
            styles.bubble,
            isMine
              ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
              : { backgroundColor: colors.card, borderBottomLeftRadius: 4 },
          ]}
          onLongPress={onLongPress}
          delayLongPress={500}
          testID={testID}
        >
          {renderReplyContext()}

          {text ? (
            <Text
              style={[
                styles.messageText,
                { color: isMine ? "#fff" : colors.text },
              ]}
            >
              {text}
            </Text>
          ) : null}

          {/* Loading / Error states */}
          {Boolean(isUploading) && (
            <LoadingIndicator type="image" progress={uploadProgress || 0} size="small" showText />
          )}
          {Boolean(uploadError) && (
            <Text style={{ color: 'red' }}>{`Upload failed: ${uploadError}`}</Text>
          )}

          {/* Voice message */}
          {messageType === 'voice' && media && media[0] && (
            <VoiceMessageBubble audioUri={media[0].uri} isMine={isMine} />
          )}

          {renderMedia()}

          {timestamp && (
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
      </View>

      {/* 🔥 Fullscreen Modal Preview */}
      <Modal
        visible={!!previewMedia}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewMedia(null)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalCloseArea}
            onPress={() => setPreviewMedia(null)}
          />
          {previewMedia && previewMedia.type.startsWith("image") && (
            <Image
              source={{ uri: previewMedia.uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
          {previewMedia && previewMedia.type.startsWith("video") && (
            <Video
              source={{ uri: previewMedia.uri }}
              style={styles.fullVideo}
              controls
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  messageRow: { marginVertical: 3, paddingHorizontal: 4 },
  myMessageRow: { alignItems: "flex-end" },
  theirMessageRow: { alignItems: "flex-start" },
  bubble: { padding: 12, borderRadius: 16, maxWidth: "80%", minWidth: 60 },
  messageText: { fontSize: 16, lineHeight: 20, marginBottom: 6 },
  timestamp: { fontSize: 11, marginTop: 4, textAlign: "right" },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 8,
    opacity: 0.9,
  },
  replySender: { fontSize: 14, fontWeight: "600" },
  replyText: { fontSize: 13, marginTop: 2, opacity: 0.8 },
  mediaContainer: { marginTop: 6, gap: 8 },
  mediaImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },
  mediaVideo: { width: 220, height: 220, borderRadius: 12, marginBottom: 8 },
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
