import React from 'react';
import { render, waitFor, screen, act } from '@testing-library/react-native';
import Content from '../../component/content/Content';

// Mock the fetch API
global.fetch = jest.fn();

describe('Deprecated Content tests', () => {
  it('skipped', () => {
    expect(true).toBe(true);
  });
});
