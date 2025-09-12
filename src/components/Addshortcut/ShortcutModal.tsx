// src/components/ShortcutModal.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert, PermissionsAndroid, Platform } from 'react-native';
import { useAppTheme } from '../../themes/useTheme';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary, launchCamera, MediaType, ImagePickerResponse } from 'react-native-image-picker';

interface ShortcutModalProps {
  visible: boolean;
  shortcutOption: string | null;
  onClose: () => void;
}

const ShortcutModal: React.FC<ShortcutModalProps> = ({ visible, shortcutOption, onClose }) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleDirectAction = async () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    if (shortcutOption === 'camera') {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
        return;
      }

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('Camera cancelled');
        } else if (response.errorMessage) {
          console.log('Camera error:', response.errorMessage);
          Alert.alert('Error', 'Failed to open camera: ' + response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          console.log('Camera image captured:', response.assets[0].uri);
          Alert.alert('Success', 'Photo captured successfully!');
        }
      });
    } else if (shortcutOption === 'gallery') {
      launchImageLibrary(options, (response: ImagePickerResponse) => {
        if (response.didCancel) {
          console.log('Gallery cancelled');
        } else if (response.errorMessage) {
          console.log('Gallery error:', response.errorMessage);
          Alert.alert('Error', 'Failed to open gallery: ' + response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          console.log('Gallery image selected:', response.assets[0].uri);
          Alert.alert('Success', 'Photo selected successfully!');
        }
      });
    }
  };

  const getActionTitle = () => {
    switch (shortcutOption) {
      case 'camera':
        return 'Open Camera';
      case 'gallery':
        return 'Open Gallery';
      default:
        return 'Unknown Action';
    }
  };

  const getActionDescription = () => {
    switch (shortcutOption) {
      case 'camera':
        return 'Take a photo with your camera';
      case 'gallery':
        return 'Select a photo from your gallery';
      default:
        return 'Perform shortcut action';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)'
      }}>
        <View style={{
          backgroundColor: colors.background,
          padding: 24,
          borderRadius: 16,
          width: '85%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <Text style={{ 
            color: colors.text, 
            fontSize: 20, 
            fontWeight: 'bold',
            marginBottom: 8,
            textAlign: 'center'
          }}>
            {getActionTitle()}
          </Text>
          
          <Text style={{ 
            color: colors.text, 
            fontSize: 16, 
            opacity: 0.7,
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {getActionDescription()}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.surface,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                flex: 1,
                marginRight: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDirectAction}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
                flex: 1,
                marginLeft: 8,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: colors.background, fontSize: 16, fontWeight: '500' }}>
                Open
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ShortcutModal;
