# Testing Project

A React Native mobile application built with TypeScript, featuring custom components and API services.

## 🚀 Features

- **Cross-platform**: iOS and Android support
- **TypeScript**: Full type safety and better development experience
- **Custom Components**: Reusable UI components
- **API Services**: Service layer for external API calls
- **Modern React**: Built with React 19 and React Native 0.81

## 📱 Screenshots

*Add your app screenshots here*

## 🛠️ Tech Stack

- **Framework**: React Native 0.81.0
- **Language**: TypeScript 5.8.3
- **UI Library**: React 19.1.0
- **Testing**: Jest + React Native Testing Library
- **Code Quality**: ESLint + Prettier
- **Package Manager**: npm

## 📋 Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd testingproject
```

### 2. Install Dependencies

```bash
npm install
```

### 3. iOS Setup (macOS only)

```bash
cd ios
bundle install
bundle exec pod install
cd ..
```

### 4. Start Metro Bundler

```bash
npm start
```

### 5. Run the App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 🏗️ Project Structure

```
testingproject/
├── android/                 # Android native code
├── ios/                    # iOS native code
├── component/              # Reusable UI components
│   ├── CustomButton.tsx   # Custom button component
│   └── CustomTextInput.tsx # Custom text input component
├── servies/               # API services and functions
│   └── apiFunction.tsx    # API handling functions
├── __tests__/             # Test files
├── App.tsx                # Main application component
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## 🧩 Components

### CustomButton
A reusable button component with customizable text and press handlers.

### CustomTextInput
A custom text input component with controlled value and change handlers.

## 🔧 Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm test` - Run test suite
- `npm run lint` - Run ESLint for code quality

## 🧪 Testing

The project uses Jest and React Native Testing Library for testing:

```bash
npm test
```

## 📱 Platform Support

- ✅ Android (API level 21+)
- ✅ iOS (iOS 12.0+)

## 🔒 Privacy

The iOS app includes privacy information in `ios/PrivacyInfo.xcprivacy`.

## 🚀 Deployment

### Android
Build APK or AAB using:
```bash
cd android
./gradlew assembleRelease
```

### iOS
Build and archive using Xcode, then distribute via App Store Connect.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

*Add your license information here*

## 📞 Support

For support and questions, please open an issue in the repository.

## 🔗 Useful Links

- [React Native Documentation](https://reactnative.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
