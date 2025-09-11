// Main themes export file - makes themes accessible from anywhere
export { useAppTheme, getThemeColors, getTheme } from './useTheme';
export { default as lightColors } from './light';
export { default as darkColors } from './dark';
export { fonts } from './fonts';

// Types
export type ThemeColors = typeof import('./light').default;
export type ThemeFonts = typeof import('./fonts').fonts;

export interface Theme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  mode: 'light' | 'dark';
}
