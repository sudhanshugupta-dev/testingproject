# 📚 Jest Testing Guide for This Project

This guide covers everything you need to know to set up, write, and run tests using **Jest** and **React Native Testing Library** in this project.

---

## 🧩 What is Jest?

[Jest](https://jestjs.io/) is a JavaScript testing framework used for unit, integration, and snapshot testing. It works seamlessly with React Native and TypeScript.

---

## ⚙️ Jest Setup in This Project

### 1. Installation

Jest and React Native Testing Library are already included in `package.json`. If you need to install manually:


# Jest Testing Guide for This Project

## What is Jest?

[Jest](https://jestjs.io/) is a delightful JavaScript testing framework maintained by Facebook, designed for simplicity and support for React and React Native projects. It allows you to write unit, integration, and snapshot tests.

---

## Why Use Jest?

- **Zero config** for React Native.
- Fast and parallel test execution.
- Built-in mocking and snapshot testing.
- Great community and documentation.

---

## Setting Up Jest in This Project

### 1. Install Dependencies

Run the following command in your project root:

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native @types/jest ts-jest
```

If you use TypeScript, also install:

```bash
npm install --save-dev @types/jest ts-jest
```

### 2. Configure Jest

Add the following to your `package.json`:

```json
"jest": {
  "preset": "react-native",
  "setupFilesAfterEnv": [
    "@testing-library/jest-native/extend-expect"
  ],
  "transform": {
    "^.+\\.(js|ts|tsx)$": "ts-jest"
  },
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/android/",
    "/ios/"
  ]
}
```

Or create a `jest.config.js` file:

```js
// filepath: /home/sudhanshu/Documents/LeaningPOC/testingproject/jest.config.js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
};
```

---

## Writing Test Cases

### Folder Structure

Place your tests in a `__tests__` folder or next to the component with `.test.tsx` or `.spec.tsx` extension.

Example:
```
src/components/CustomButton.tsx
src/components/__tests__/CustomButton.test.tsx
```

---

### Example: Testing a Component

Suppose you have a `CustomButton.tsx` component:

```tsx
// filepath: /home/sudhanshu/Documents/LeaningPOC/testingproject/src/components/CustomButton.tsx
import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export const CustomButton = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} testID="custom-button">
    <Text>{title}</Text>
  </TouchableOpacity>
);
```

**Test file:**

```tsx
// filepath: /home/sudhanshu/Documents/LeaningPOC/testingproject/src/components/__tests__/CustomButton.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CustomButton } from '../CustomButton';

describe('CustomButton', () => {
  it('renders with correct title', () => {
    const { getByText } = render(<CustomButton title="Click Me" onPress={() => {}} />);
    expect(getByText('Click Me')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<CustomButton title="Press" onPress={onPressMock} />);
    fireEvent.press(getByTestId('custom-button'));
    expect(onPressMock).toHaveBeenCalled();
  });
});
```

---

### Example: Testing a Function

Suppose you have a utility function:

```ts
// filepath: /home/sudhanshu/Documents/LeaningPOC/testingproject/src/utils/calc.ts
export const add = (a: number, b: number) => a + b;
```

**Test file:**

```ts
// filepath: /home/sudhanshu/Documents/LeaningPOC/testingproject/src/utils/__tests__/calc.test.ts
import { add } from '../calc';

test('adds two numbers', () => {
  expect(add(2, 3)).toBe(5);
});
```

---

## Running Tests

To run all tests:

```bash
npm test
```
or
```bash
npx jest
```

To run tests with coverage:

```bash
npx jest --coverage
```

---

## Best Practices

- Use descriptive test names.
- Test both positive and negative cases.
- Mock dependencies as needed.
- Use `@testing-library/react-native` for UI tests.

---

## Troubleshooting

- If tests fail to find components, check your testID and imports.
- For async code, use `await` and `findBy...` queries.
- Clear mocks between tests with `afterEach(jest.clearAllMocks)`.

---

## References

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Testing Library Docs](https://testing-library.com/docs/react-native-testing-library/intro/)

---

**Now you are ready to write and run tests for your project!**