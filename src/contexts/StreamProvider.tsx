import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  StreamVideoClient, 
  StreamVideo,
  StreamVideoProvider 
} from '@stream-io/video-react-native-sdk';
import { generateUserToken } from '../utils/tokenGenerator';
import { getStreamConfig } from '../config/streamConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

interface StreamContextType {
  client: StreamVideoClient | null;
  connectUser: (userId: string, userName: string) => Promise<void>;
  disconnectUser: () => Promise<void>;
  isConnecting: boolean;
}

const StreamContext = createContext<StreamContextType | undefined>(undefined);

export const useStreamClient = () => {
  const context = useContext(StreamContext);
  if (!context) {
    throw new Error('useStreamClient must be used within a StreamProvider');
  }
  return context;
};

export const StreamProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get user from Redux store
  const user = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);
  
  // Get Stream configuration
  const streamConfig = getStreamConfig();
  
  const connectUser = async (userId: string, userName: string) => {
  if (!userId || !userName) {
    console.error('StreamProvider: Missing userId or userName');
    return;
  }
  
  if (isConnecting) {
    console.log('StreamProvider: Already connecting...');
    return;
  }
  
  setIsConnecting(true);
  
  try {
    if (client) {
      await client.disconnectUser();
      setClient(null);
    }
    
    const userToken = await generateUserToken(userId);
    console.log("Generated token:", userToken);
    const streamUser = { 
      id: userId, 
      name: userName, 
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`
    };
    
    const newClient = new StreamVideoClient({ 
      apiKey: streamConfig.API_KEY, 
      user: streamUser, 
      token: userToken 
    });
    
    await newClient.connectUser(streamUser, userToken);
    console.log("ew", newClient);
    setClient(newClient);
    console.log('StreamProvider: User connected successfully', { userId, userName });
  } catch (error) {
    console.error('StreamProvider: Failed to connect user:', error);
  } finally {
    setIsConnecting(false);
  }
};

  const disconnectUser = async () => {
    if (client) {
      try {
        await client.disconnectUser();
        setClient(null);
        console.log('StreamProvider: User disconnected');
      } catch (error) {
        console.error('StreamProvider: Failed to disconnect user:', error);
      }
    }
  };

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (user && token && !client && !isConnecting) {
      connectUser(user.uid, user.name || user.email || 'User');
    }
  }, [user, token]);

  // Auto-disconnect when user logs out
  useEffect(() => {
    if (!user || !token) {
      disconnectUser();
    }
  }, [user, token]);

  return (
    <StreamContext.Provider value={{ 
      client, 
      connectUser, 
      disconnectUser, 
      isConnecting 
    }}>
      {client ? (
        <StreamVideo client={client}>
          {children}
        </StreamVideo>
      ) : (
        children
      )}
    </StreamContext.Provider>
  );
};