import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import securityService from '../../services/securityService';

export default function SecuritySetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = String(params.userId || '');
  
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [enableBiometric, setEnableBiometric] = useState(false);
  const [enablePIN, setEnablePIN] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1: choose options, 2: set PIN

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const available = await securityService.isBiometricAvailable();
    setBiometricAvailable(available);
    if (available) {
      const type = await securityService.getBiometricType();
      setBiometricType(type);
    }
  };

  const handleContinue = async () => {
    if (!enableBiometric && !enablePIN) {
      // Skip security setup
      router.replace('/(tabs)');
      return;
    }

    if (enablePIN && step === 1) {
      setStep(2);
      return;
    }

    if (enablePIN && step === 2) {
      if (pin.length < 4) {
        Alert.alert('Error', 'PIN must be at least 4 digits');
        return;
      }
      if (pin !== confirmPin) {
        Alert.alert('Error', 'PINs do not match');
        return;
      }
    }

    try {
      // Test biometric if enabled
      if (enableBiometric) {
        const biometricSuccess = await securityService.authenticateWithBiometric();
        if (!biometricSuccess) {
          Alert.alert('Error', 'Biometric authentication failed. Please try again.');
          return;
        }
      }

      // Save PIN if enabled
      if (enablePIN) {
        await securityService.savePIN(userId, pin);
      }

      // Save security settings
      await securityService.saveSecuritySettings(userId, {
        pinEnabled: enablePIN,
        biometricEnabled: enableBiometric,
      });

      // Save last authenticated user
      await securityService.saveLastAuthenticatedUser(userId);

      Alert.alert('Success', 'Security settings saved!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      console.error('Save security error:', error);
      Alert.alert('Error', 'Failed to save security settings');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Security Setup',
      'You can enable security features later in your profile settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => router.replace('/(tabs)') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={64} color="#007AFF" />
        <Text style={styles.title}>Secure Your Account</Text>
        <Text style={styles.subtitle}>
          {step === 1 
            ? 'Choose how you want to protect your account'
            : 'Set up your PIN'}
        </Text>
      </View>

      {step === 1 ? (
        <View style={styles.optionsContainer}>
          {biometricAvailable && (
            <TouchableOpacity
              style={[styles.optionCard, enableBiometric && styles.optionCardActive]}
              onPress={() => setEnableBiometric(!enableBiometric)}
            >
              <View style={styles.optionHeader}>
                <Ionicons 
                  name="finger-print" 
                  size={32} 
                  color={enableBiometric ? '#007AFF' : '#666'} 
                />
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{biometricType}</Text>
                  <Text style={styles.optionDescription}>
                    Use your {biometricType.toLowerCase()} to unlock
                  </Text>
                </View>
              </View>
              {enableBiometric && (
                <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.optionCard, enablePIN && styles.optionCardActive]}
            onPress={() => setEnablePIN(!enablePIN)}
          >
            <View style={styles.optionHeader}>
              <Ionicons 
                name="keypad" 
                size={32} 
                color={enablePIN ? '#007AFF' : '#666'} 
              />
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>PIN Lock</Text>
                <Text style={styles.optionDescription}>
                  Use a 4-digit PIN to unlock
                </Text>
              </View>
            </View>
            {enablePIN && (
              <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.pinContainer}>
          <TextInput
            style={styles.pinInput}
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            autoFocus
          />
          <TextInput
            style={styles.pinInput}
            placeholder="Confirm PIN"
            value={confirmPin}
            onChangeText={setConfirmPin}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            {step === 1 && !enableBiometric && !enablePIN
              ? 'Skip'
              : step === 1 && enablePIN
              ? 'Next'
              : 'Complete'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  optionCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  pinContainer: {
    gap: 16,
  },
  pinInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    letterSpacing: 8,
  },
  buttonContainer: {
    marginTop: 'auto',
    gap: 12,
  },
  skipButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
