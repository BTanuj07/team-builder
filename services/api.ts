import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use localhost for Android emulator, 10.0.2.2, or your computer's IP for physical device
const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.0.104:5000/api'; // For physical device, use your computer's IP
    // return 'http://10.0.2.2:5000/api'; // Android emulator
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:5000/api'; // Web
  }
  return 'http://localhost:5000/api'; // iOS simulator
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('authToken');
      } catch (e) {
        console.log('Error deleting token:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
