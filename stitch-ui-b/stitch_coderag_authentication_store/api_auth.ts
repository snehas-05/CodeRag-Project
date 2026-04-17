import apiClient from './client';

/**
 * CodeRAG 2026 Architecture: Auth API
 * 
 * Features:
 * - Typed request and response models.
 * - Integration with the centralized Axios client.
 * - Support for multi-tenant login and registration.
 */

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    provider: 'github' | 'gitlab';
  };
  accessToken: string;
  tenantId: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  provider?: 'github' | 'gitlab';
  code?: string; // For OAuth flows
}

export interface RegisterRequest {
  email: string;
  name: string;
  password?: string;
  organizationName: string;
}

/**
 * Registers a new user and creates a tenant.
 */
export const register = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  } catch (error) {
    // Error handling is partially managed by the interceptor, 
    // but we re-throw for local component handling (e.g., showing a toast)
    throw error;
  }
};

/**
 * Logs in an existing user.
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logs out the current user (server-side invalidation if supported).
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    console.error('Logout request failed:', error);
  }
};
