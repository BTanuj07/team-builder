import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Modal, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import authService from '../../services/authService';
import securityService from '../../services/securityService';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [pendingUserId, setPendingUserId] = useState('');
  const [securitySettings, setSecuritySettings] = useState<any>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(email.toLowerCase().trim(), password);
      console.log('Login response:', response);
      const userId = String(response.user._id || response.user.id);
      console.log('User ID:', userId);
      
      // Check if user has security enabled
      const settings = await securityService.getSecuritySettings(userId);
      console.log('Security settings:', settings);
      
      if (settings && (settings.pinEnabled || settings.biometricEnabled)) {
        // User has security enabled, show security check
        console.log('Security enabled, showing modal');
        setPendingUserId(userId);
        setSecuritySettings(settings);
        setShowSecurityModal(true);
        setIsLoading(false);
      } else {
        // No security, proceed to app
        console.log('No security, proceeding to app');
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', error.response?.data?.message || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const success = await securityService.authenticateWithBiometric();
      if (success) {
        await securityService.saveLastAuthenticatedUser(pendingUserId);
        setShowSecurityModal(false);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication failed. Please try again or use PIN.');
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication error');
    }
  };

  const handlePinAuth = async () => {
    if (securityPin.length < 4) {
      Alert.alert('Error', 'Please enter your PIN');
      return;
    }

    try {
      const isValid = await securityService.verifyPIN(pendingUserId, securityPin);
      if (isValid) {
        await securityService.saveLastAuthenticatedUser(pendingUserId);
        setShowSecurityModal(false);
        setSecurityPin('');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Invalid PIN', 'The PIN you entered is incorrect');
        setSecurityPin('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify PIN');
    }
  };

  const handleCancelSecurity = () => {
    setShowSecurityModal(false);
    setSecurityPin('');
    setPendingUserId('');
    setSecuritySettings(null);
  };

  useEffect(() => {
    if (showSecurityModal && securitySettings?.biometricEnabled) {
      // Auto-trigger biometric if enabled
      handleBiometricAuth();
    }
  }, [showSecurityModal]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Ionicons name="people-circle" size={80} color="#007AFF" />
        <Text style={styles.title}>Team Builder</Text>
        <Text style={styles.subtitle}>Find your perfect hackathon team</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.demoCredentials}>
          <Text style={styles.demoTitle}>Demo Credentials:</Text>
          <Text style={styles.demoText}>Email: arjun@example.com</Text>
          <Text style={styles.demoText}>Password: password123</Text>
        </View>
      </View>

      <Modal visible={showSecurityModal} transparent animationType="fade">
        <View style={styles.securityModalOverlay}>
          <View style={styles.securityModalContent}>
            <Ionicons name="shield-checkmark" size={64} color="#007AFF" />
            <Text style={styles.securityModalTitle}>Unlock Account</Text>
            <Text style={styles.securityModalSubtitle}>
              {securitySettings?.biometricEnabled && securitySettings?.pinEnabled
                ? 'Use biometric or enter your PIN'
                : securitySettings?.biometricEnabled
                ? 'Use biometric to unlock'
                : 'Enter your PIN to unlock'}
            </Text>

            {securitySettings?.pinEnabled && (
              <View style={styles.pinInputContainer}>
                <TextInput
                  style={styles.pinInput}
                  placeholder="Enter PIN"
                  value={securityPin}
                  onChangeText={setSecurityPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  autoFocus={!securitySettings?.biometricEnabled}
                />
                <TouchableOpacity style={styles.pinSubmitButton} onPress={handlePinAuth}>
                  <Text style={styles.pinSubmitButtonText}>Unlock</Text>
                </TouchableOpacity>
              </View>
            )}

            {securitySettings?.biometricEnabled && (
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth}>
                <Ionicons name="finger-print" size={24} color="#007AFF" />
                <Text style={styles.biometricButtonText}>Use Biometric</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSecurity}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoCredentials: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 5,
  },
  demoText: {
    fontSize: 13,
    color: '#666',
  },
  securityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  securityModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  securityModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  securityModalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  pinInputContainer: {
    width: '100%',
    gap: 12,
  },
  pinInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    letterSpacing: 12,
  },
  pinSubmitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pinSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginTop: 12,
    gap: 8,
  },
  biometricButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
