# Virtual Try-On App - Frontend

A React Native mobile application built with Expo, featuring phone authentication and AI-powered virtual try-on capabilities.

## 🚀 Features

- 📱 **Mobile-First Design**: Optimized for iOS and Android
- 🔐 **Phone Authentication**: OTP-based login system
- 📸 **Photo Management**: Camera and gallery integration
- 🤖 **AI Integration**: Ready for AI model integration
- 🎨 **Apple-Inspired UI**: Clean, minimal design system
- ⚡ **Fast Development**: Hot reload with Expo

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **UI**: Custom components with Apple-inspired design

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Emulator
- Expo Go app on physical device (optional)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

Update the `.env` file with your backend URL:
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start the Development Server

```bash
npm start
# or
npx expo start
```

### 4. Run on Device/Simulator

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan QR code with Expo Go app

## 📁 Project Structure

```
frontend/
├── app/                    # App screens (Expo Router)
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Splash screen
│   ├── auth.tsx           # Authentication screen
│   ├── dashboard.tsx      # Main dashboard
│   └── upload.tsx         # Photo upload screen
├── components/            # Reusable UI components
│   ├── Button.tsx         # Custom button component
│   ├── Input.tsx          # Custom input component
│   └── Screen.tsx         # Screen wrapper component
├── constants/             # App constants
│   └── theme.ts           # Design system (colors, typography, etc.)
├── services/              # API services
│   ├── api.ts             # Axios configuration
│   ├── auth.ts            # Authentication service
│   ├── upload.ts          # Upload service
│   └── ai.ts              # AI service
├── types/                 # TypeScript type definitions
│   └── api.ts             # API response types
└── assets/                # Static assets
```

## 🎨 Design System

The app uses an Apple-inspired design system with:

- **Colors**: Primary blues, neutral grays, semantic colors
- **Typography**: San Francisco-style font weights and sizes
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable, accessible UI components

## 📱 App Flow

1. **Splash Screen** → Auto-navigation based on auth status
2. **Authentication** → Phone number + OTP verification
3. **Dashboard** → Main hub with action buttons
4. **Upload Photos** → Camera/gallery integration
5. **Generate Avatar** → AI processing (stub implementation)

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator
- `npm run ios` - Run on iOS simulator  
- `npm run web` - Run on web browser

## 🌐 API Integration

The app connects to the FastAPI backend with:

- **Authentication**: Phone/OTP login
- **File Upload**: Multipart form data
- **AI Requests**: Avatar generation
- **Auto-retry**: Automatic token refresh

## 🚧 Development Notes

### Authentication Flow
- OTP is mocked for development
- Tokens stored in AsyncStorage
- Auto-redirect on auth state changes

### Image Handling
- Supports camera and photo library
- Auto-compression for uploads
- Preview before upload

### Error Handling
- User-friendly error messages
- Network error recovery
- Form validation

## 📦 Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## 🔮 Future Enhancements

- [ ] Real OTP integration (Twilio/Firebase)
- [ ] Push notifications
- [ ] Offline mode support
- [ ] Advanced camera features
- [ ] Social sharing
- [ ] User profiles and settings

---

For backend setup, see `../backend/README.md`