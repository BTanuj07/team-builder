# Run on Windows Computer

## Option 1: Android Emulator (Best for Testing)

### Step 1: Install Android Studio
Download from: https://developer.android.com/studio

### Step 2: Setup Android Emulator
1. Open Android Studio
2. Go to Tools → Device Manager
3. Click "Create Device"
4. Select a phone (e.g., Pixel 5)
5. Download a system image (Android 13 recommended)
6. Click Finish

### Step 3: Start Emulator
1. In Device Manager, click Play button
2. Wait for emulator to boot

### Step 4: Run App
```bash
# Start backend
npm run backend

# Start Expo (new terminal)
npm start

# Press 'a' to open in Android emulator
```

## Option 2: Web Browser (Simplest)

```bash
# Start backend
npm run backend

# Start Expo (new terminal)
npm start

# Press 'w' to open in web browser
```

Opens at `http://localhost:8081`

## Option 3: Windows Desktop App (Advanced)

Not directly supported by Expo. Would need:
- Electron wrapper
- React Native for Windows
- Significant code changes

Recommendation: Use Android Emulator or Web version.
