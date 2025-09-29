export const generateUserToken = async (userId: string): Promise<string> => {
  try {
    const response = await fetch('https://servercall-fql7.onrender.com/token', {  // Replace with your server URL (e.g., https://your-domain.com/token for prod)
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch token');
    }
    const { token } = await response.json();
    console.log('Fetched token for user:', token);
    return token;
  } catch (error) {
    console.error('Failed to fetch token:', error);
    throw error;
  }
};



// http://192.168.0.206:5000/token'