import React from 'react';
import { render } from '@testing-library/react-native';
import { CustomButton } from '../../component/custombutton/CustomButton';

describe('CustomButton', () => {
  test('matches snapshot with default props', () => {
    const { toJSON } = render(
      <CustomButton onPress={jest.fn()}>Click Me</CustomButton>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
