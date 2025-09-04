import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutFirebase,
} from '../../services/firebase/auth';

type AuthState = {
  user: { uid: string; email?: string | null; name:string} | null;
  token: string | null;
  loading: boolean;
  error?: string | null;
};

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const loginWithEmail = createAsyncThunk(
  'auth/loginWithEmail',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      console.log(email, password)
      const cred = await signInWithEmail(email, password);
      console.log(cred, "correct it");
      const token = await cred.user.getIdToken();
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem(
        'user',
        JSON.stringify({ uid: cred.user.uid, email: cred.user.email, name: cred.user.name }),
      );
      return { token, user: { uid: cred.user.uid, email: cred.user.email, name: cred.user.name  } };
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Login failed');
    }
  },
);

export const signupWithEmail = createAsyncThunk(
  'auth/signupWithEmail',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue },
  ) => {
   
    try {
      const cred = await signUpWithEmail(email, password);
      const token = await cred.user.getIdToken();
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem(
        'user',
        JSON.stringify({ uid: cred.user.uid, email: cred.user.email , name: cred.user.name}),
      );
      return { token, user: { uid: cred.user.uid, email: cred.user.email, name: cred.user.name } };
    } catch (e: any) {
      return rejectWithValue(e?.message || 'Signup failed');
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await signOutFirebase();
  await AsyncStorage.multiRemove(['token', 'user']);
  return true;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    restoreAuth: (
      state,
      action: PayloadAction<{ token: string | null; user: AuthState['user'] }>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginWithEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginWithEmail.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(signupWithEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signupWithEmail.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { restoreAuth } = authSlice.actions;
export default authSlice.reducer;
