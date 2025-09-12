import React from 'react';
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useAppTheme } from '../../themes';

const { width } = Dimensions.get('window');

interface GoogleSignUpButtonProps {
  onPress: () => void;
  title: String;
  testID?: string;
}

const GoogleSignUpButton: React.FC<GoogleSignUpButtonProps> = ({
  onPress,
  title,
  testID,
}) => {
  const { colors } = useAppTheme();
  
  return (
    <TouchableOpacity
      testID={testID || "google-button"}
      style={[styles.button, { 
        borderColor: colors.border,
        backgroundColor: colors.surface 
      }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{
          uri: 'https://developers.google.com/identity/images/g-logo.png',
        }}
        style={styles.icon}
      />
      <Text style={[styles.buttonText, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.9,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignUpButton;
