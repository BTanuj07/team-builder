# FORCE COMPLETE RELOAD

The app is using cached code. You MUST do a complete reload:

## Method 1: Clear Cache and Restart

```bash
# Stop Expo (Ctrl+C in terminal)
# Then run:
npx expo start -c
```

## Method 2: In Expo Go App

1. Shake your device
2. Tap "Reload"
3. If error persists, close Expo Go completely
4. Reopen Expo Go
5. Scan QR code again

## Method 3: Nuclear Option

```bash
# Stop everything (Ctrl+C)
# Delete cache
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules\.cache

# Restart
npm start
```

## After Reload, Test:

1. Go to Profile tab
2. Click + button next to Skills
3. Should show: "Available: React, Node.js, Python..." 
4. Enter "React" exactly
5. Should add successfully

If you still see "Cannot read property 'length' of undefined", the app hasn't reloaded the new code yet.
