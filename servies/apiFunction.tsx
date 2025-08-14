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
    console.log(json);
    return { success: true };
    console.log('Success', 'Data sent successfully!');
  } catch (error) {
    console.error('Error:', error);
    console.log('Error', 'Something went wrong!');
  }
};

export const handleButtonPress = (inputValue: any) => {
  if (inputValue.trim() === '') {
    console.log('Validation Error', 'Please enter a value');
  } else {
    dummyApiCall(inputValue);
  }
};
