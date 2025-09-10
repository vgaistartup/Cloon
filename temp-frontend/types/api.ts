export interface User {
  user_id: string;
  phone_number: string;
  created_at: string;
  is_active: boolean;
  profile_photos: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  token_type?: string;
  user_id?: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  expires_at: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  file_url?: string;
  file_id?: string;
}

export interface AIGenerateResponse {
  success: boolean;
  message: string;
  avatar_url?: string;
  processing_time: number;
  request_id: string;
}