// Stream.io Configuration
// Replace these values with your actual Stream.io credentials

// Development mode flag - set to true to bypass configuration validation
export const DEVELOPMENT_MODE = true; // Set to false in production

export const STREAM_CONFIG = {
  // Your Stream.io API Key
  // Get this from your Stream.io dashboard: https://getstream.io/dashboard/
  API_KEY: 'sh2esb6ray3x', // Replace with your actual API key
  
  // Your Stream.io API Secret
  // Get this from your Stream.io dashboard: https://getstream.io/dashboard/
  // IMPORTANT: Never commit this to version control in production!
  API_SECRET: 'cugusvhyqvjb5vp6xqquw92r69zyh2bbausjgw7x4c96z9uj59tnyj5287sjzvrd', // Replace with your actual secret
  
  // Stream.io region (optional)
  // Options: 'us-east', 'us-west', 'eu-west', 'asia-southeast1'
  REGION: 'us-east',
  
  // Token expiry time in seconds (default: 1 hour)
  TOKEN_EXPIRY: 60 * 60, // 1 hour
  
  // Call settings
  CALL_SETTINGS: {
    // Default call type
    DEFAULT_CALL_TYPE: 'video', // 'video' or 'audio'
    
    // Ring timeout in seconds
    RING_TIMEOUT: 30,
    
    // Enable call recording (requires premium plan)
    ENABLE_RECORDING: false,
  },
};

// Validation function to check if configuration is complete
export const validateStreamConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!STREAM_CONFIG.API_KEY || STREAM_CONFIG.API_KEY === 'sh2esb6ray3x') {
    errors.push('Stream API Key is not configured');
  }
  
  if (!STREAM_CONFIG.API_SECRET || STREAM_CONFIG.API_SECRET === 'YOUR_STREAM_SECRET_HERE') {
    errors.push('Stream API Secret is not configured');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to get Stream configuration
export const getStreamConfig = () => {
  // Skip validation in development mode
  if (DEVELOPMENT_MODE) {
    console.log('StreamProvider: Running in development mode');
    return {
      API_KEY: STREAM_CONFIG.API_KEY,
      TOKEN_EXPIRY: STREAM_CONFIG.TOKEN_EXPIRY,
      REGION: STREAM_CONFIG.REGION,
      CALL_SETTINGS: STREAM_CONFIG.CALL_SETTINGS,
    };
  }
  
  const validation = validateStreamConfig();
  if (!validation.isValid) {
    console.error('Stream configuration errors:', validation.errors);
    throw new Error('Stream configuration is incomplete. Please check your API keys.');
  }
  
  return STREAM_CONFIG;
};
