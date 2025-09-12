import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export const getInitialTheme = async (): Promise<'light' | 'dark'> => {
  try {
    // Try to get stored theme first
    const storedTheme = await AsyncStorage.getItem('theme');
    
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
    
    // If no stored theme, use system preference and store it
    const systemTheme = Appearance.getColorScheme();
    const defaultTheme = systemTheme === 'dark' ? 'dark' : 'light';
    
    // Store the system theme for future use
    await AsyncStorage.setItem('theme', defaultTheme);
    return defaultTheme;
  } catch (error) {
    console.warn('Failed to load theme from storage:', error);
    // Fallback to system theme or light
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? 'dark' : 'light';
  }
};

// Synchronous version for immediate use (less reliable but faster)
export const getInitialThemeSync = (): 'light' | 'dark' => {
  try {
    const systemTheme = Appearance.getColorScheme();
    return systemTheme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};
