import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { restoreTheme } from './themeSlice';
import { restoreLanguage } from './languageSlice';
import { restoreAuth } from './authSlice';

type AppState = { bootstrapped: boolean };
const initialState: AppState = { bootstrapped: false };

export const bootstrapApp = createAsyncThunk('app/bootstrap', async (_, { dispatch }) => {
  const [theme, lang, token, user] = await Promise.all([
    AsyncStorage.getItem('theme'),
    AsyncStorage.getItem('language'),
    AsyncStorage.getItem('token'),
    AsyncStorage.getItem('user'),
  ]);

  if (theme === 'light' || theme === 'dark') dispatch(restoreTheme(theme));
  if (lang === 'en' || lang === 'hi' || lang === 'es') dispatch(restoreLanguage(lang));
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
