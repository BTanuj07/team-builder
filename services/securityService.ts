import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

interface SecuritySettings {
  pinEnabled: boolean;
  biometricEnabled: boolean;
  userId: string;
}

class SecurityService {
  // Check if device supports biometric authentication
  async isBiometricAvailable(): Promise<boolean> {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Biometric check error:', error);
      return false;
    }
  }

  // Get biometric type (fingerprint, face, iris)
  async getBiometricType(): Promise<string> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      return 'Biometric';
    } catch (error) {
      return 'Biometric';
    }
  }

  // Authenticate with biometric
  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: false,
      });
      return result.success;
    } catch (error) {
      console.error('Biometric auth error:', error);
      return false;
    }
  }

  // Save PIN for user (hashed)
  async savePIN(userId: string, pin: string): Promise<void> {
    try {
      const key = `pin_${userId}`;
      // Simple hash using btoa (base64 encoding) - works in React Native
      const hashedPin = btoa(pin);
      await SecureStore.setItemAsync(key, hashedPin);
    } catch (error) {
      console.error('Save PIN error:', error);
      throw error;
    }
  }

  // Verify PIN
  async verifyPIN(userId: string, pin: string): Promise<boolean> {
    try {
      const key = `pin_${userId}`;
      const storedHash = await SecureStore.getItemAsync(key);
      if (!storedHash) return false;
      
      const hashedPin = btoa(pin);
      return storedHash === hashedPin;
    } catch (error) {
      console.error('Verify PIN error:', error);
      return false;
    }
  }

  // Save security settings for user
  async saveSecuritySettings(userId: string, settings: Omit<SecuritySettings, 'userId'>): Promise<void> {
    try {
      const key = `security_${userId}`;
      const data: SecuritySettings = { ...settings, userId };
      console.log('Saving security settings:', { key, data });
      await SecureStore.setItemAsync(key, JSON.stringify(data));
      console.log('Security settings saved successfully');
    } catch (error) {
      console.error('Save security settings error:', error);
      throw error;
    }
  }

  // Get security settings for user
  async getSecuritySettings(userId: string): Promise<SecuritySettings | null> {
    try {
      const key = `security_${userId}`;
      console.log('Getting security settings for key:', key);
      const data = await SecureStore.getItemAsync(key);
      console.log('Security data retrieved:', data);
      if (!data) return null;
      const parsed = JSON.parse(data);
      console.log('Parsed security settings:', parsed);
      return parsed;
    } catch (error) {
      console.error('Get security settings error:', error);
      return null;
    }
  }

  // Check if user has security enabled
  async hasSecurityEnabled(userId: string): Promise<boolean> {
    const settings = await this.getSecuritySettings(userId);
    return settings ? (settings.pinEnabled || settings.biometricEnabled) : false;
  }

  // Delete security data for user
  async deleteSecurityData(userId: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(`pin_${userId}`);
      await SecureStore.deleteItemAsync(`security_${userId}`);
    } catch (error) {
      console.error('Delete security data error:', error);
    }
  }

  // Save last authenticated user
  async saveLastAuthenticatedUser(userId: string): Promise<void> {
    try {
      // Ensure userId is a string
      const userIdString = String(userId);
      await SecureStore.setItemAsync('last_authenticated_user', userIdString);
    } catch (error) {
      console.error('Save last user error:', error);
    }
  }

  // Get last authenticated user
  async getLastAuthenticatedUser(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('last_authenticated_user');
    } catch (error) {
      console.error('Get last user error:', error);
      return null;
    }
  }
}

export default new SecurityService();
