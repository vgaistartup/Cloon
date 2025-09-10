import api from './api';
import { UploadResponse } from '@/types/api';

export class UploadService {
  static async uploadPhoto(uri: string, fileName?: string): Promise<UploadResponse> {
    const formData = new FormData();
    
    // Create file object
    formData.append('file', {
      uri,
      type: 'image/jpeg',
      name: fileName || 'photo.jpg',
    } as any);

    const response = await api.post('/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
}