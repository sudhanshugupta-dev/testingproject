// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import Modal from "react-native-modal";
// import { launchImageLibrary } from "react-native-image-picker";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";
// // import DocumentPicker from "react-native-document-picker";

// type Props = {
//   visible: boolean;
//   onClose: () => void;
//   onResult: (result: any) => void;
// };

// const PickerBottomSheet: React.FC<Props> = ({ visible, onClose, onResult }) => {
//   // Pick Image / Video
// const pickMedia = async () => {
//   try {
//     const res = await launchImageLibrary({
//       mediaType: "mixed", // 'photo' | 'video' | 'mixed'
//       selectionLimit: 0,  // 0 = unlimited on Android, up to 10 on iOS
//     });

//     if (!res.didCancel && res.assets) {
//       // return all selected assets
//       onResult(res.assets);
//     }
//   } catch (e) {
//     console.log("Media pick error:", e);
//   } finally {
//     onClose();
//   }
// };

//   // Pick File
//   // const pickFile = async () => {
//   //   try {
//   //     const res = await DocumentPicker.pick({
//   //       type: [DocumentPicker.types.allFiles],
//   //     });
//   //     onResult(res[0]);
//   //   } catch (err) {
//   //     if (!DocumentPicker.isCancel(err)) console.log(err);
//   //   } finally {
//   //     onClose();
//   //   }
//   // };

//   return (
//     <Modal
//       isVisible={visible}
//       onBackdropPress={onClose}
//       style={styles.modal}
//     >
//       <View style={styles.sheet}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Select an Option</Text>
//         </View>

//         <TouchableOpacity style={styles.option} onPress={pickMedia}>
//           <Icon name="image-multiple-outline" size={22} color="#4A90E2" />
//           <Text style={styles.optionText}>Pick Image / Video</Text>
//         </TouchableOpacity>

//         {/* <TouchableOpacity style={styles.option} onPress={pickFile}>
//           <Icon name="file-outline" size={22} color="#50C878" />
//           <Text style={styles.optionText}>Pick File</Text>
//         </TouchableOpacity> */}

//         <TouchableOpacity
//           style={[styles.option, styles.cancel]}
//           onPress={onClose}
//         >
//           <Icon name="close-circle-outline" size={22} color="#E94E4E" />
//           <Text style={[styles.optionText, { color: "#E94E4E" }]}>Cancel</Text>
//         </TouchableOpacity>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modal: {
//     justifyContent: "flex-end",
//     margin: 0,
//   },
//   sheet: {
//     backgroundColor: "#fff",
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   header: {
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   option: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderColor: "#eee",
//   },
//   optionText: {
//     fontSize: 16,
//     marginLeft: 12,
//     color: "#333",
//   },
//   cancel: {
//     borderBottomWidth: 0,
//     marginTop: 8,
//   },
// });

// export default PickerBottomSheet;


import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import Modal from "react-native-modal";
import { launchImageLibrary, Asset } from "react-native-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type Props = {
  visible: boolean;
  onClose: () => void;
  onResult: (result: Asset[]) => void;
};

const PickerBottomSheet: React.FC<Props> = ({ visible, onClose, onResult }) => {
  const requestGalleryPermission = async () => {
    if (Platform.OS === "android") {
      if (Platform.Version >= 33) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]);
      } else {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
      }
    }
  };

  const pickMedia = async () => {
    try {
      await requestGalleryPermission();

      const res = await launchImageLibrary({
        mediaType: "mixed",
        selectionLimit: 0,
      });

      if (!res.didCancel && res.assets) {
        onResult(res.assets);
      }
    } catch (e) {
      console.log("Media pick error:", e);
    } finally {
      onClose();
    }
  };

  return (
    <Modal isVisible={visible} onBackdropPress={onClose} style={styles.modal}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Select an Option</Text>
        </View>

        <TouchableOpacity style={styles.option} onPress={pickMedia}>
          <Icon name="image-multiple-outline" size={22} color="#4A90E2" />
          <Text style={styles.optionText}>Pick Image / Video</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.option, styles.cancel]} onPress={onClose}>
          <Icon name="close-circle-outline" size={22} color="#E94E4E" />
          <Text style={[styles.optionText, { color: "#E94E4E" }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { justifyContent: "flex-end", margin: 0 },
  sheet: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
  },
  header: { alignItems: "center", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "600", color: "#333" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  optionText: { fontSize: 16, marginLeft: 12, color: "#333" },
  cancel: { borderBottomWidth: 0, marginTop: 8 },
});

export default PickerBottomSheet;
