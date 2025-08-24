import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

describe('App Navigation Flow', () => {
  it('renders without crashing and shows Splash or Login content', async () => {
    const { findByText } = render(<App />);
    // Due to i18n mock, keys are returned. We assert presence of either Splash title key or Login labels.
    expect(await findByText(/app.title|auth.email/i)).toBeTruthy();
  });
});
