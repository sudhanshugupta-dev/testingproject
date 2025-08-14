import { render, fireEvent } from '@testing-library/react-native';
import { CustomButton } from '../../component/CustomButton';

describe('<CustomButton />', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <CustomButton onPress={() => {}}>Click Me</CustomButton>,
    );
    const buttonText = getByText('Click Me');
    expect(buttonText).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <CustomButton onPress={onPressMock}>Click Me</CustomButton>,
    );
    const buttonText = getByText('Click Me');

    // Fire the press event
    fireEvent.press(buttonText);

    // Verify if onPress function was called and log to the console
    expect(onPressMock).toHaveBeenCalledTimes(1);
    console.log('Button was pressed');
  });

  it('renders with different text', () => {
    const { getByText } = render(
      <CustomButton onPress={() => {}}>Submit</CustomButton>,
    );
    expect(getByText('Submit')).toBeTruthy();
  });
});
