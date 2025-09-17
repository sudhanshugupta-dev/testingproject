import { Alert } from 'react-native';

export const dummyApiCall = async (data: string) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputValue: data }),
    });

    const json = await response.json();
    return { success: true };
    console.warn('Success', 'Data sent successfully!');
  } catch (error) {
    console.error('Error:', error);
    console.warn('Error', 'Something went wrong!');
  }
};

export const handleButtonPress = (inputValue: any, navigation: any) => {
  if (inputValue.trim() === '') {
    console.warn('Validation Error', 'Please enter a value');
  } else {
    navigation.navigate('Content')
    dummyApiCall(inputValue);
  }
};
