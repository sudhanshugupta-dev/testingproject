import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../localization/i18n';

type LangState = { code: 'en' | 'hi' | 'es' };
const initialState: LangState = { code: 'en' };

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LangState['code']>) => {
      state.code = action.payload;
      i18n.changeLanguage(action.payload);
      AsyncStorage.setItem('language', action.payload).catch(() => {});
    },
    restoreLanguage: (state, action: PayloadAction<LangState['code']>) => {
      state.code = action.payload;
      i18n.changeLanguage(action.payload);
    },
  },
});

export const { setLanguage, restoreLanguage } = languageSlice.actions;
export default languageSlice.reducer;
