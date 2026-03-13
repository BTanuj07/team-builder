# Quick Start Guide - Run the App

## Easiest Way: Web Browser

```bash
# Terminal 1: Start Backend
npm run backend

# Terminal 2: Start Frontend
npm start

# Then press 'w' for web
```

App opens at: `http://localhost:8081`

## Best Way: Android Emulator

### One-Time Setup:
1. Download Android Studio: https://developer.android.com/studio
2. Install it
3. Open Android Studio → Tools → Device Manager
4. Create a virtual device (Pixel 5, Android 13)

### Every Time:
```bash
# Start emulator from Android Studio Device Manager

# Terminal 1: Start Backend
npm run backend

# Terminal 2: Start Frontend  
npm start

# Press 'a' for Android
```

## Physical Phone: Expo Go

```bash
# Terminal 1: Start Backend
npm run backend

# Terminal 2: Start Frontend
npm start

# Scan QR code with Expo Go app
```

## Build Standalone APK

```bash
# Install EAS CLI (one time)
npm install -g eas-cli

# Login
eas login

# Build
eas build -p android --profile preview

# Download APK from link (takes 15-20 min)
```

## Recommended for Demo:
Use Android Emulator - looks professional and works perfectly!
