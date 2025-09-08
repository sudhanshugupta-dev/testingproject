import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../store';
import { fetchMessagesPage, listenToMessages, Message } from '../../services/firebase/chat';

// ---- Types ----
export interface MessagesState {
  messages: Record<string, Message[]>; // roomId -> messages array
  loading: Record<string, boolean>; // roomId -> loading state
  error: Record<string, string | null>; // roomId -> error state
  hasMoreMessages: Record<string, boolean>; // roomId -> has more messages
  oldestTimestamp: Record<string, number | null>; // roomId -> oldest message timestamp for pagination
  realTimeListeners: Record<string, (() => void) | null>; // roomId -> unsubscribe function
}

const initialState: MessagesState = {
  messages: {},
  loading: {},
  error: {},
  hasMoreMessages: {},
  oldestTimestamp: {},
  realTimeListeners: {},
};

// ---- Async Thunks ----

// Load initial messages page for a room
export const loadInitialMessages = createAsyncThunk(
  'messages/loadInitialMessages',
  async ({ roomId, limit = 20 }: { roomId: string; limit?: number }, { rejectWithValue }) => {
    try {
      console.log('Loading initial messages for room:', roomId);
      const messages = await fetchMessagesPage(roomId, limit);
      return { roomId, messages };
    } catch (error: any) {
      console.error('Error loading initial messages:', error);
      return rejectWithValue({ roomId, error: error.message });
    }
  }
);

// Load older messages for pagination
export const loadOlderMessages = createAsyncThunk(
  'messages/loadOlderMessages',
  async (
    { roomId, limit = 20, beforeTimestamp }: { roomId: string; limit?: number; beforeTimestamp: number },
    { rejectWithValue }
  ) => {
    try {
      console.log('Loading older messages for room:', roomId, 'before:', beforeTimestamp);
      const messages = await fetchMessagesPage(roomId, limit, beforeTimestamp);
      return { roomId, messages, beforeTimestamp };
    } catch (error: any) {
      console.error('Error loading older messages:', error);
      return rejectWithValue({ roomId, error: error.message });
    }
  }
);

// ---- Slice ----
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Set messages from real-time listener
    setRoomMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: Message[] }>
    ) => {
      const { roomId, messages } = action.payload;
      state.messages[roomId] = messages;
      state.error[roomId] = null;
      
      // Update oldest timestamp for pagination
      if (messages.length > 0) {
        const oldest = messages[0];
        const timestamp = oldest.createdAt?.toString ? Number(oldest.createdAt) : (oldest.createdAt as number);
        state.oldestTimestamp[roomId] = timestamp;
      }
    },

    // Add a new message (optimistic update)
    addOptimisticMessage: (
      state,
      action: PayloadAction<{ roomId: string; message: Message }>
    ) => {
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);
    },

    // Remove a message (failed optimistic update)
    removeMessage: (
      state,
      action: PayloadAction<{ roomId: string; messageId: string }>
    ) => {
      const { roomId, messageId } = action.payload;
      if (state.messages[roomId]) {
        state.messages[roomId] = state.messages[roomId].filter(msg => msg.id !== messageId);
      }
    },

    // Update message ID (after successful send)
    updateMessageId: (
      state,
      action: PayloadAction<{ roomId: string; tempId: string; newId: string }>
    ) => {
      const { roomId, tempId, newId } = action.payload;
      if (state.messages[roomId]) {
        const messageIndex = state.messages[roomId].findIndex(msg => msg.id === tempId);
        if (messageIndex !== -1) {
          state.messages[roomId][messageIndex].id = newId;
        }
      }
    },

    // Set loading state for a room
    setRoomLoading: (
      state,
      action: PayloadAction<{ roomId: string; loading: boolean }>
    ) => {
      const { roomId, loading } = action.payload;
      state.loading[roomId] = loading;
    },

    // Set error state for a room
    setRoomError: (
      state,
      action: PayloadAction<{ roomId: string; error: string | null }>
    ) => {
      const { roomId, error } = action.payload;
      state.error[roomId] = error;
      state.loading[roomId] = false;
    },

    // Clear messages for a room
    clearRoomMessages: (state, action: PayloadAction<string>) => {
      const roomId = action.payload;
      delete state.messages[roomId];
      delete state.loading[roomId];
      delete state.error[roomId];
      delete state.hasMoreMessages[roomId];
      delete state.oldestTimestamp[roomId];
      
      // Stop real-time listener
      if (state.realTimeListeners[roomId]) {
        state.realTimeListeners[roomId]!();
        delete state.realTimeListeners[roomId];
      }
    },

    // Store real-time listener unsubscribe function
    setRealTimeListener: (
      state,
      action: PayloadAction<{ roomId: string; unsubscribe: (() => void) | null }>
    ) => {
      const { roomId, unsubscribe } = action.payload;
      // Stop previous listener if exists
      if (state.realTimeListeners[roomId]) {
        state.realTimeListeners[roomId]!();
      }
      state.realTimeListeners[roomId] = unsubscribe;
    },
  },
  extraReducers: (builder) => {
    // Load initial messages
    builder
      .addCase(loadInitialMessages.pending, (state, action) => {
        const roomId = action.meta.arg.roomId;
        state.loading[roomId] = true;
        state.error[roomId] = null;
      })
      .addCase(loadInitialMessages.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        state.loading[roomId] = false;
        state.messages[roomId] = messages;
        state.hasMoreMessages[roomId] = messages.length === action.meta.arg.limit;
        
        // Set oldest timestamp for pagination
        if (messages.length > 0) {
          const oldest = messages[0];
          const timestamp = oldest.createdAt?.toString ? Number(oldest.createdAt) : (oldest.createdAt as number);
          state.oldestTimestamp[roomId] = timestamp;
        }
      })
      .addCase(loadInitialMessages.rejected, (state, action) => {
        const roomId = (action.payload as any).roomId;
        const error = (action.payload as any).error;
        state.loading[roomId] = false;
        state.error[roomId] = error;
      });

    // Load older messages
    builder
      .addCase(loadOlderMessages.pending, (state, action) => {
        const roomId = action.meta.arg.roomId;
        state.loading[roomId] = true;
      })
      .addCase(loadOlderMessages.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        state.loading[roomId] = false;
        
        if (messages.length === 0) {
          state.hasMoreMessages[roomId] = false;
        } else {
          // Prepend older messages to existing messages
          if (state.messages[roomId]) {
            state.messages[roomId] = [...messages, ...state.messages[roomId]];
          } else {
            state.messages[roomId] = messages;
          }
          
          // Update oldest timestamp
          const oldest = messages[0];
          const timestamp = oldest.createdAt?.toString ? Number(oldest.createdAt) : (oldest.createdAt as number);
          state.oldestTimestamp[roomId] = timestamp;
          
          state.hasMoreMessages[roomId] = messages.length === action.meta.arg.limit;
        }
      })
      .addCase(loadOlderMessages.rejected, (state, action) => {
        const roomId = (action.payload as any).roomId;
        const error = (action.payload as any).error;
        state.loading[roomId] = false;
        state.error[roomId] = error;
      });
  },
});

export const {
  setRoomMessages,
  addOptimisticMessage,
  removeMessage,
  updateMessageId,
  setRoomLoading,
  setRoomError,
  clearRoomMessages,
  setRealTimeListener,
} = messagesSlice.actions;

export default messagesSlice.reducer;

// ---- Thunk Actions for Real-time Listeners ----

/**
 * Start real-time listener for a chat room
 */
export const startRoomMessageListener = (roomId: string) => (dispatch: AppDispatch) => {
  console.log('Starting real-time listener for room:', roomId);
  
  const unsubscribe = listenToMessages(roomId, (messages) => {
    console.log('Real-time messages received for room:', roomId, messages.length);
    
    // Convert timestamps to numbers for consistency
    const processedMessages = messages.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt?.toMillis ? msg.createdAt.toMillis() : msg.createdAt || Date.now(),
      id: msg.id || `${msg.senderId}-${msg.createdAt}`,
    }));
    
    dispatch(setRoomMessages({ roomId, messages: processedMessages }));
  });
  
  dispatch(setRealTimeListener({ roomId, unsubscribe }));
};

/**
 * Stop real-time listener for a chat room
 */
export const stopRoomMessageListener = (roomId: string) => (dispatch: AppDispatch) => {
  console.log('Stopping real-time listener for room:', roomId);
  dispatch(setRealTimeListener({ roomId, unsubscribe: null }));
};

/**
 * Load older messages with pagination
 */
export const loadMoreMessages = (roomId: string, oldestTimestamp: number) => (dispatch: AppDispatch) => {
  dispatch(loadOlderMessages({ roomId, beforeTimestamp: oldestTimestamp }));
};
