import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Text } from 'react-native';
import Card from '../../src/components/Card';
import { useAppTheme } from '../../src/themes/useTheme';

// Mock the theme hook
jest.mock('../../src/themes/useTheme', () => ({
  useAppTheme: jest.fn(),
}));

// Mock Redux store
const mockStore = configureStore({
  reducer: {
    theme: (state = { mode: 'light' }) => state,
  },
});

const mockTheme = {
  colors: {
    card: '#ffffff',
    text: '#000000',
  },
  fonts: {
    sizes: {
      small: 12,
      medium: 14,
      large: 16,
    },
    weight: {
      normal: '400',
      medium: '500',
      bold: '700',
    },
  },
};

describe('Card Component', () => {
  beforeEach(() => {
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <Provider store={mockStore}>
        <Card>
          <Text>Test Content</Text>
        </Card>
      </Provider>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies custom style correctly', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <Card style={customStyle} testID="card">
          <Text>Test Content</Text>
        </Card>
      </Provider>
    );

    const card = getByTestId('card');
    expect(card.props.style).toContainEqual(customStyle);
  });

  it('applies theme colors correctly', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <Card testID="card">
          <Text>Test Content</Text>
        </Card>
      </Provider>
    );

    const card = getByTestId('card');
    const cardStyle = card.props.style.find((style: any) => style.backgroundColor);
    expect(cardStyle.backgroundColor).toBe(mockTheme.colors.card);
  });

  it('renders with default styles', () => {
    const { getByTestId } = render(
      <Provider store={mockStore}>
        <Card testID="card">
          <Text>Test Content</Text>
        </Card>
      </Provider>
    );

    const card = getByTestId('card');
    const baseStyle = card.props.style.find((style: any) => style.borderRadius === 14);
    expect(baseStyle).toBeTruthy();
  });
});
