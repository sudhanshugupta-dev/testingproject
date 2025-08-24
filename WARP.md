# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Setup and Installation
```bash
npm install                           # Install dependencies
cd ios && bundle install && bundle exec pod install && cd ..  # iOS setup (macOS only)
```

### Running the Application
```bash
npm start                            # Start Metro bundler
npm run android                      # Run on Android device/emulator
npm run ios                          # Run on iOS device/simulator
```

### Testing
```bash
npm test                             # Run all tests
npm test -- --testPathPattern=component    # Run component unit tests
npm test -- --testPathPattern=integration  # Run integration tests  
npm test -- --testPathPattern=snapshot     # Run snapshot tests
npm test -- --watch                 # Run tests in watch mode
```

### Code Quality
```bash
npm run lint                         # Run ESLint
```

### Platform-Specific Builds
```bash
cd android && ./gradlew assembleRelease    # Build Android APK/AAB
# iOS builds done through Xcode
```

## Architecture Overview

### Application Structure
This is a React Native application with TypeScript that follows a feature-based architecture with strict separation of concerns:

- **Navigation**: Stack navigation for auth flow, bottom tabs for main app (Chat, Requests, Profile)
- **State Management**: Redux Toolkit with slices for auth, theme, language, chats, and app bootstrap
- **Authentication**: Firebase Auth with AsyncStorage for token persistence
- **Internationalization**: i18next with support for English, Hindi, Spanish, French, and Japanese
- **Theming**: Light/dark mode support with centralized theme management
- **Firebase Integration**: Modular Firebase services for auth, chat, and requests

### Key Architectural Patterns

#### Redux State Management
- `src/redux/store.ts` - Central store configuration
- Slices pattern with async thunks for API calls
- AuthSlice handles login/logout with token persistence
- Theme and language slices for user preferences
- Bootstrap slice for app initialization

#### Navigation Flow
- Conditional navigation based on authentication state (`token` in Redux)
- Splash screen during app bootstrap
- Auth stack (Login, Signup, ForgotPassword, etc.) when unauthenticated
- Main tabs navigation when authenticated
- Modal/stack screens for ChatRoom and other overlays

#### Component Architecture
- Strict folder structure compliance (each component has index, styles, etc.)
- Reusable UI components in `src/components/` and root `component/`
- Custom components: CustomButton, CustomTextInput, CustomAvatar, ChatBubble
- Animated tab bar with custom icons and transitions

#### Firebase Services Structure
- Modular services in `src/services/firebase/`
- Separated by functionality: auth.ts, chat.ts, requests.ts
- Centralized configuration in index.ts
- Currently has Firebase setup (mostly commented out for development)

#### Testing Strategy
- Three testing levels: unit tests, integration tests, snapshot tests
- Component tests in `__tests__/componentUnitTest/`
- Integration tests in `__tests__/integrationTest/`
- Snapshot tests in `__tests__/snapshotTest/`
- Comprehensive mocking setup in jest.setup.js for Firebase and React Native modules

### Critical Development Guidelines

#### File Organization
- PascalCase for component files (e.g., CustomButton.tsx)
- camelCase for functions and variables  
- kebab-case for folder names when applicable
- Each screen requires: index, View, Container, styles files
- Each component requires: index, styles files

#### Firebase Integration
- All Firebase code must be in `src/services/firebase/`
- Export reusable functions (signInWithEmail, sendMessage) in separate service files
- Never inline Firebase logic in screens or components
- Mock Firebase calls in all tests

#### UI/UX Requirements
- Material icons via react-native-vector-icons/MaterialCommunityIcons
- Gradients using react-native-linear-gradient
- Animations with react-native-reanimated
- Rounded avatars with user initials
- Toast messages for user feedback (react-native-toast-message)
- Safe area handling with react-native-safe-area-context

#### State and Navigation Rules
- AsyncStorage for token persistence
- No back navigation to auth screens after login
- Conditional navigation based on authentication state
- Tab bar icons: message-circle (Chat), user-plus (Requests), account-circle (Profile)

### Tech Stack
- **Framework**: React Native 0.81.0 with React 19.1.0
- **Language**: TypeScript 5.8.3
- **State**: Redux Toolkit with React Redux
- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **Firebase**: Auth, Firestore, Database (v23.1.0)
- **UI**: Vector Icons, Linear Gradient, Reanimated 4.0
- **Testing**: Jest + React Native Testing Library
- **Internationalization**: i18next + react-i18next
- **Storage**: AsyncStorage

### Common Pitfalls
- Do not assume or hardcode data unless explicitly stated
- Always use reusable components instead of duplicating UI code
- All UI strings must be translatable through i18next
- Form validation is mandatory with user-friendly error messages
- Cross-platform compatibility is required (iOS 12.0+, Android API 21+)
- Complete, runnable code is expected - no pseudocode or placeholders

### Development Notes
- Metro bundler configuration is standard with react-native-worklets plugin
- ESLint uses @react-native/eslint-config preset
- TypeScript extends @react-native/typescript-config
- Comprehensive Jest setup with mocks for Firebase, Reanimated, and other native modules
