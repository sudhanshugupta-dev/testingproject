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