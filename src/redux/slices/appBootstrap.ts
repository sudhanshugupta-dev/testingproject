import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreTheme } from './themeSlice';
import { restoreLanguage } from './languageSlice';
import { restoreAuth } from './authSlice';
import { Appearance } from 'react-native';

type AppState = { bootstrapped: boolean };
const initialState: AppState = { bootstrapped: false };

export const bootstrapApp = createAsyncThunk('app/bootstrap', async (_, { dispatch, getState }) => {
  const [lang, token, user] = await Promise.all([
    AsyncStorage.getItem('language'),
    AsyncStorage.getItem('token'),
    AsyncStorage.getItem('user'),
  ]);

  // Skip theme restoration since it's already handled in App.tsx
  // This prevents overriding the pre-loaded theme

  if (lang === 'en' || lang === 'hi' || lang === 'es' || lang === 'fr' || lang === 'ja') dispatch(restoreLanguage(lang as any));
  dispatch(restoreAuth({ token, user: user ? JSON.parse(user) : null }));
  return true;
});

const appBootstrap = createSlice({
  name: 'app',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(bootstrapApp.fulfilled, (state) => {
      state.bootstrapped = true;
    });
  },
});

export default appBootstrap.reducer;
