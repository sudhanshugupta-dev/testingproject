import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, MediaType, ImagePickerResponse } from 'react-native-image-picker';

const requestCameraPermission = async (): Promise<boolean> => {
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

export const openCamera = async (): Promise<void> => {
  const options = {
    mediaType: 'photo' as MediaType,
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
  };

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
};

export const openGallery = (): void => {
  const options = {
    mediaType: 'photo' as MediaType,
    includeBase64: false,
    maxHeight: 2000,
    maxWidth: 2000,
  };

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
};
