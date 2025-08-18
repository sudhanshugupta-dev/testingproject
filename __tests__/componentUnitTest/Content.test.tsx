import React from 'react';
import { render, waitFor, screen, act } from '@testing-library/react-native';
import Content from '../../component/content/Content';

// Mock the fetch API
global.fetch = jest.fn();

describe('Content', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders loading indicator initially', async () => {
    await act(async () => {
      render(<Content />);
    });
    expect(screen.getByTestId('ActivityIndicator')).toBeOnTheScreen();
  });

  it('fetches and renders data successfully', async () => {
    const mockData = [
      { id: 1, title: 'Test Post', body: 'This is a test post' },
    ];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockData),
    });

    await act(async () => {
      render(<Content />);
    });

    await act(async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('ActivityIndicator')).not.toBeOnTheScreen();
        expect(screen.getByText('Test Post')).toBeOnTheScreen();
        expect(screen.getByText('This is a test post')).toBeOnTheScreen();
      });
    });
  });

  it('displays error message on fetch failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<Content />);
    });

    await act(async () => {
      await waitFor(() => {
        expect(screen.queryByTestId('ActivityIndicator')).not.toBeOnTheScreen();
        expect(screen.getByText('Failed to fetch data')).toBeOnTheScreen();
      });
    });
  });
});
