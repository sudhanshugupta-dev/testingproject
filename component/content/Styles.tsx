import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
    },
    item: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    error: {
      color: 'red',
      fontSize: 16,
    },
  });
  
  export default styles;