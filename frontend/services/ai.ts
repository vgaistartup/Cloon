import api from './api';
import { AIGenerateResponse } from '@/types/api';

export class AIService {
  static async generateAvatar(
    userId: string,
    photoUrls: string[],
    style: string = 'casual'
  ): Promise<AIGenerateResponse> {
    const response = await api.post('/ai/generate-avatar', {
      user_id: userId,
      photo_urls: photoUrls,
      style,
    });
    
    return response.data;
  }

  static async getAvailableModels() {
    const response = await api.get('/ai/models');
    return response.data;
  }

  static async getAvatarStyles() {
    const response = await api.get('/ai/styles');
    return response.data;
  }
}