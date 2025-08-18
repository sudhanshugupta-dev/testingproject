import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RequestsContainer = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Requests</Text>
      <Text>Incoming and Connected users will appear here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({ container: { flex: 1, padding: 16, backgroundColor: '#fff' }, title: { fontWeight: '700', fontSize: 18, marginBottom: 8 } });

export default RequestsContainer;
