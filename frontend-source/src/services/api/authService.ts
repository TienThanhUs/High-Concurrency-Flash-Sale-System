import { axiosClient } from './axiosClient';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../types/auth';

export const authService = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const response = await axiosClient.post<AuthResponse>('/auth/register', payload);
    return response.data;
  },
};
