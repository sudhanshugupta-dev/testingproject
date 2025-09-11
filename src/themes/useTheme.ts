import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import light from './light';
import dark from './dark';
import { fonts } from './fonts';

export const useAppTheme = () => {
  const mode = useSelector((s: RootState) => s.theme.mode);
  const colors = mode === 'dark' ? dark : light;
  return { mode, colors, fonts } as const;
};

// Static theme getters for styles files (when hooks can't be used)
export const getThemeColors = (mode: 'light' | 'dark') => {
  return mode === 'dark' ? dark : light;
};

export const getTheme = (mode: 'light' | 'dark') => {
  return {
    mode,
    colors: getThemeColors(mode),
    fonts
  };
}; 