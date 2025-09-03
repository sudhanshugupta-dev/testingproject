import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";
import Modal from "react-native-modal";
import { launchImageLibrary, launchCamera, Asset } from "react-native-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onResult: (result: Asset[]) => void;
  testID?: string;
};

const PickerBottomSheet: React.FC<Props> = ({ visible, onClose, onResult, testID }) => {
  /**
   * Request gallery permission for Android
   */
  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS !== "android") return true;

    try {
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);

        return (
          result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
            PermissionsAndroid.RESULTS.GRANTED ||
          result[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn("Gallery permission error:", err);
      return false;
    }
  };

  /**
   * Request camera permission for Android
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS !== "android") return true;

    try {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn("Camera permission error:", err);
      return false;
    }
  };

  /**
   * Pick images or videos from gallery
   */
  const pickMedia = async () => {
    try {
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please allow gallery access to select media."
        );
        return;
      }

      const res = await launchImageLibrary({
        mediaType: "mixed",
        selectionLimit: 0,
        includeBase64: false,
        quality: 0.8,
      });

      if (res.assets && res.assets.length > 0) {
        onResult(res.assets);
      } else if (res.didCancel) {
        console.log("PickerBottomSheet: User cancelled gallery selection");
      }
    } catch (e) {
      console.error("PickerBottomSheet: Media pick error:", e);
      Alert.alert("Error", "Failed to pick media. Please try again.");
    } finally {
      onClose();
    }
  };

  /**
   * Take photo with camera
   */
  const takePhoto = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          "Please allow camera access to take a photo."
        );
        return;
      }

      const res = await launchCamera({
        mediaType: "photo",
        quality: 0.8,
        includeBase64: false,
        saveToPhotos: true,
      });

      if (res.assets && res.assets.length > 0) {
        onResult(res.assets);
      } else if (res.didCancel) {
        console.log("PickerBottomSheet: User cancelled camera");
      }
    } catch (e) {
      console.error("PickerBottomSheet: Camera error:", e);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <Modal
      testID={testID || "picker-modal"}
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      useNativeDriver={true}
      hideModalContentWhileAnimating={true}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
    >
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View style={styles.handle} />
          <Text style={styles.title}>Select Media</Text>
        </View>

        <TouchableOpacity style={styles.option} onPress={pickMedia}>
          <Icon name="image-multiple-outline" size={24} color="#4A90E2" />
          <Text style={styles.optionText}>Pick Image / Video</Text>
          <Icon name="chevron-right" size={20} color="#999" style={styles.arrow} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={takePhoto}>
          <Icon name="camera" size={24} color="#50C878" />
          <Text style={styles.optionText}>Take Photo</Text>
          <Icon name="chevron-right" size={20} color="#999" style={styles.arrow} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.option, styles.cancel]} onPress={onClose}>
          <Icon name="close-circle-outline" size={24} color="#E94E4E" />
          <Text style={[styles.optionText, { color: "#E94E4E" }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  sheet: {
    backgroundColor: "#fff",
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
    color: "#333",
    flex: 1,
  },
  arrow: {
    marginLeft: "auto",
  },
  cancel: {
    borderBottomWidth: 0,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 20,
  },
});

export default PickerBottomSheet;