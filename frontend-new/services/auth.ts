import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, OTPResponse } from '@/types/api';

export class AuthService {
  static async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    const response = await api.post('/auth/send-otp', {
      phone_number: phoneNumber,
    });
    return response.data;
  }

  static async verifyOTP(phoneNumber: string, otpCode: string): Promise<AuthResponse> {
    const response = await api.post('/auth/verify-otp', {
      phone_number: phoneNumber,
      otp_code: otpCode,
    });
    
    const data = response.data;
    
    if (data.success && data.access_token) {
      await AsyncStorage.setItem('access_token', data.access_token);
      await AsyncStorage.setItem('user_id', data.user_id);
    }
    
    return data;
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user_id');
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('access_token');
      return !!token;
    } catch (error) {
      console.warn('Auth check failed:', error);
      return false; // Return false instead of crashing
    }
  }

  static async getUserId(): Promise<string | null> {
    return await AsyncStorage.getItem('user_id');
  }
}