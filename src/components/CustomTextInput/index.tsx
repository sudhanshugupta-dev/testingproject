import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = { label?: string; value: string; onChangeText: (t: string) => void; placeholder?: string; secureTextEntry?: boolean; style?: ViewStyle };

const CustomTextInput = ({ label, value, onChangeText, placeholder, secureTextEntry, style }: Props) => {
  const [secured, setSecured] = useState(!!secureTextEntry);
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} secureTextEntry={secured} placeholderTextColor="#9CA3AF" />
        {secureTextEntry ? (
          <MaterialCommunityIcons name={secured ? 'eye-off-outline' : 'eye-outline'} size={22} color="#6B7280" onPress={() => setSecured(!secured)} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 6, color: '#6B7280' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12 },
  input: { flex: 1, height: 44, color: '#111827' },
});

export default CustomTextInput;
