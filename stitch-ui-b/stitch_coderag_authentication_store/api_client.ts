import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

/**
 * CodeRAG 2026 Architecture: API Client
 * 
 * Features:
 * - Singleton Axios instance for centralized networking.
 * - Automatic Bearer token injection from Zustand store.
 * - Global 401 handling for session invalidation.
 * - Environment-driven configuration.
 */

// Define custom headers if needed for multi-tenancy or telemetry
interface CustomHeaders {
  'X-Tenant-ID'?: string;
  'X-Client-Version'?: string;
}

const baseURL = import.meta.env.VITE_API_URL || 'https://api.coderag.ai/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30s timeout for complex RAG queries
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Injects the JWT and Tenant ID from the Auth Store into every outgoing request.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken, tenantId } = useAuthStore.getState();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (tenantId) {
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles global error states, specifically 401 Unauthorized for forced logout.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const { clearAuth } = useAuthStore.getState();

    if (error.response?.status === 401) {
      // Clear local session state
      clearAuth();

      // Force redirect to login page if window exists (client-side)
      if (typeof window !== 'undefined') {
        window.location.href = '/login?reason=session_expired';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
