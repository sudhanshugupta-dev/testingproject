import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import PickerBottomSheet from '../components/PickerBottomSheet';

const TestPicker = ({ testID }: { testID?: string }) => {
  const [visible, setVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);

  return (
    <View testID={testID || "test-picker"} style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          console.log('Test: Opening PickerBottomSheet');
          setVisible(true);
        }}
      >
        <Text style={styles.buttonText}>Open Picker</Text>
      </TouchableOpacity>

      <Text style={styles.text}>
        Selected files: {selectedFiles.length}
      </Text>

      <PickerBottomSheet
        visible={visible}
        onClose={() => {
          console.log('Test: Closing PickerBottomSheet');
          setVisible(false);
        }}
        onResult={(res) => {
          console.log('Test: PickerBottomSheet result:', res.length, 'files');
          setSelectedFiles([...selectedFiles, ...res]);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default TestPicker;
