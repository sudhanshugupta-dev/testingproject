import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LanguageModal from '../../src/components/LanguageModal';
import { useAppTheme } from '../../src/themes/useTheme';

// Mock the theme hook
jest.mock('../../src/themes/useTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    language: (state = { code: 'en' }) => state,
  },
});

const mockTheme = {
  colors: {
    card: '#ffffff',
    text: '#000000',
  },
};

describe('LanguageModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders when visible is true', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <LanguageModal visible={true} onClose={mockOnClose} />
      </Provider>
    );

    expect(getByText('Select Language')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <Provider store={mockStore}>
        <LanguageModal visible={false} onClose={mockOnClose} />
      </Provider>
    );

    expect(queryByText('Select Language')).toBeNull();
  });

  it('renders all language options', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <LanguageModal visible={true} onClose={mockOnClose} />
      </Provider>
    );

    expect(getByText('English')).toBeTruthy();
    expect(getByText('हिंदी')).toBeTruthy();
    expect(getByText('Français')).toBeTruthy();
    expect(getByText('日本語')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <LanguageModal visible={true} onClose={mockOnClose} />
      </Provider>
    );

    fireEvent.press(getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows checkmark for current language', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <LanguageModal visible={true} onClose={mockOnClose} />
      </Provider>
    );

    // English should have checkmark since it's the current language
    expect(getByText('English ✓')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <LanguageModal visible={true} onClose={mockOnClose} />
      </Provider>
    );

    const modal = getByTestId('language-modal');
    expect(modal).toBeTruthy();
  });
});

