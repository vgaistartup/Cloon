import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, OTPResponse } from '@/types/api';
import { supabase, isSupabaseConfigured } from './supabase';

export class AuthService {
  static async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: { channel: 'sms' },
      });
      if (error) throw error;
      return { success: true, message: 'OTP sent via Supabase', data } as any;
    }

    const response = await api.post('/auth/send-otp', {
      phone_number: phoneNumber,
    });
    return response.data;
  }

  static async verifyOTP(phoneNumber: string, otpCode: string): Promise<AuthResponse> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otpCode,
        type: 'sms',
      });
      if (error) throw error;

      // Persist a simple flag for the rest of the app (existing logic)
      if (data?.session?.access_token) {
        await AsyncStorage.setItem('access_token', data.session.access_token);
        if (data.user?.id) await AsyncStorage.setItem('user_id', data.user.id);
      }
      return { success: true, access_token: data.session?.access_token || '', user_id: data.user?.id || '' } as any;
    }

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
    if (isSupabaseConfigured && supabase) {
      try { await supabase.auth.signOut(); } catch {}
    }
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user_id');
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) return true;
      }
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
