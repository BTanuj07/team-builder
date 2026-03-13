import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.log('Notifications require a physical device');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push notification permissions');
        return false;
      }

      return true;
    } catch (error) {
      console.log('Notification permissions not available (Expo Go limitation)');
      return false;
    }
  }

  // Get push token
  async getPushToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
      
      // Save token locally
      await AsyncStorage.setItem('pushToken', token);
      
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  // Schedule local notification
  async scheduleNotification(title: string, body: string, data?: any, seconds: number = 0) {
    try {
      const trigger = seconds > 0 
        ? { seconds, repeats: false } as Notifications.TimeIntervalTriggerInput
        : null;
        
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Send immediate notification
  async sendNotification(title: string, body: string, data?: any) {
    await this.scheduleNotification(title, body, data, 0);
  }

  // Team invitation notification
  async notifyTeamInvitation(teamName: string, inviterName: string) {
    await this.sendNotification(
      'Team Invitation',
      `${inviterName} invited you to join ${teamName}`,
      { type: 'team_invitation', teamName, inviterName }
    );
  }

  // Project match notification
  async notifyProjectMatch(projectTitle: string, matchCount: number) {
    await this.sendNotification(
      'New Project Match',
      `${matchCount} team member${matchCount > 1 ? 's' : ''} found for "${projectTitle}"`,
      { type: 'project_match', projectTitle, matchCount }
    );
  }

  // AI recommendation notification
  async notifyAIRecommendation(message: string) {
    await this.sendNotification(
      'AI Team Builder',
      message,
      { type: 'ai_recommendation' }
    );
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get notification settings
  async getSettings() {
    try {
      const enabled = await AsyncStorage.getItem('notificationsEnabled');
      return enabled !== 'false'; // Default to true
    } catch (error) {
      return true;
    }
  }

  // Update notification settings
  async setSettings(enabled: boolean) {
    try {
      await AsyncStorage.setItem('notificationsEnabled', enabled.toString());
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  // Add notification listener
  addNotificationListener(callback: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Add notification response listener (when user taps notification)
  addNotificationResponseListener(callback: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default new NotificationService();
