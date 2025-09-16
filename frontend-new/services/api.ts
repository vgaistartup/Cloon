import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For production/demo, we'll use a placeholder or disable API calls
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com'; // Placeholder for production

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout to prevent hanging
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_id');
    }
    return Promise.reject(error);
  }
);

export default api;