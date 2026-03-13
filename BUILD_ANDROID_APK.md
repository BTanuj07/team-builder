# Build Android APK - Standalone App

## Option 1: Build APK with EAS (Recommended)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS
```bash
eas build:configure
```

### Step 4: Build APK
```bash
# For Android APK (can install on any Android device)
eas build -p android --profile preview
```

This will:
- Upload your code to Expo servers
- Build the APK in the cloud
- Give you a download link when done (takes 10-20 minutes)

### Step 5: Download and Install
- Download the APK from the link
- Transfer to your Android phone
- Install it (enable "Install from unknown sources")

## Option 2: Build Locally (Faster but Complex)

### Requirements:
- Android Studio installed
- Java JDK 17
- Android SDK

### Steps:
```bash
# Install dependencies
npm install

# Build locally
npx expo run:android
```

This requires Android Studio setup which is complex.

## Option 3: Web Version (Easiest)

Run as a web app in your browser:

```bash
npm run web
```

Opens at `http://localhost:8081`

Note: Some mobile features won't work on web.
