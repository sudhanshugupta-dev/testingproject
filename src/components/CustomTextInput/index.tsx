import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../themes/useTheme';

type Props = { label?: string; value: string; onChangeText: (t: string) => void; placeholder?: string; secureTextEntry?: boolean; style?: ViewStyle };

const CustomTextInput = ({ label, value, onChangeText, placeholder, secureTextEntry, style }: Props) => {
  const [secured, setSecured] = useState(!!secureTextEntry);
  const { colors, fonts } = useAppTheme();
  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={[styles.label, { color: colors.text, opacity: 0.7 }]}>{label}</Text> : null}
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.text + '22' }]}>
        <TextInput style={[styles.input, { color: colors.text, fontSize: fonts.sizes.medium }]} value={value} onChangeText={onChangeText} placeholder={placeholder} secureTextEntry={secured} placeholderTextColor="#9CA3AF" />
        {secureTextEntry ? (
          <Ionicons name={secured ? 'eye-off' : 'eye'} size={22} color="#6B7280" onPress={() => setSecured(!secured)} />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { marginBottom: 6 , fontWeight:'700'},
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 12, borderWidth: 1 },
  input: { flex: 1, height: 44 },
});

export default CustomTextInput;
