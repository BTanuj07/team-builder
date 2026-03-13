import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as Device from 'expo-device';
import { ThemeProvider } from '../contexts/ThemeContext';

export default function RootLayout() {
  useEffect(() => {
    // Skip notification initialization in Expo Go
    if (Device.isDevice && !__DEV__) {
      initializeNotifications();
    }
  }, []);

  const initializeNotifications = async () => {
    try {
      // Dynamically import to avoid Expo Go errors
      const notificationService = await import('../services/notificationService');
      await notificationService.default.requestPermissions();
      
      const notificationListener = notificationService.default.addNotificationListener((notification) => {
        console.log('Notification received:', notification);
      });

      const responseListener = notificationService.default.addNotificationResponseListener((response) => {
        console.log('Notification tapped:', response);
      });

      return () => {
        notificationListener.remove();
        responseListener.remove();
      };
    } catch (error) {
      console.log('Notifications not available');
    }
  };

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
