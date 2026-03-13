import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  college?: string;
  skills: any[];
  availability: string;
  portfolioLinks: string[];
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

class AuthService {
  async register(name: string, email: string, password: string, college?: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', { name, email, password, college });
    if (response.data.success) {
      try {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        console.log('Error storing auth data:', error);
      }
    }
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      try {
        await AsyncStorage.setItem('authToken', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        console.log('Error storing auth data:', error);
      }
    }
    return response.data;
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      console.log('Error getting current user:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.log('Error during logout:', error);
    }
  }

  async getStoredUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.log('Error getting stored user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.log('Error checking authentication:', error);
      return false;
    }
  }
}

export default new AuthService();
