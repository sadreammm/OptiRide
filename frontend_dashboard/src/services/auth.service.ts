import { apiClient, handleApiError } from '@/lib/api.config';

export interface LoginRequest {
  token_data: any; // Firebase token or other auth token
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface UserResponse {
  user_id: string;
  email: string;
  user_type: 'admin' | 'driver';
  admin_id?: string;
  created_at: string;
}

export interface AdminCreateUserRequest {
  email: string;
  password: string;
  user_type: 'admin' | 'driver';
  phone_number?: string;
}

export const authService = {
  // Admin creates a user
  async createUser(data: AdminCreateUserRequest): Promise<UserResponse> {
    try {
      const response = await apiClient.post('/auth/admin/create-user', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Admin deletes a user
  async deleteUser(userId: string): Promise<{ detail: string }> {
    try {
      const response = await apiClient.delete(`/auth/admin/delete-user/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // User login
  async login(tokenData: any): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', tokenData);
      
      // Store token and user data
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // User logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    } catch (error) {
      // Always clear local storage on logout attempt
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      throw handleApiError(error);
    }
  },

  // Get current user info
  async getMe(): Promise<UserResponse> {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get stored user from localStorage
  getStoredUser(): UserResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.user_type === 'admin';
  },
};
