import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * CodeRAG 2026 Architecture: AuthStore
 * 
 * Features:
 * - Zustand for performant state management.
 * - Zero-Trust Workload Identity for vector database tokens.
 * - Multi-tenant isolation via strict tenant_id validation.
 * - Integration with GitHub/GitLab providers.
 */

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: 'github' | 'gitlab';
}

interface AuthState {
  // Core Identity
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  tenantId: string | null;

  // Zero-Trust Workload Identity
  vectorToken: string | null;
  vectorTokenExpiresAt: number | null;

  // Actions
  setAuth: (user: User, token: string, tenantId: string) => void;
  clearAuth: () => void;
  
  /**
   * Generates or refreshes a short-lived token for vector database operations.
   * Implements the 2026 'Workload Identity' pattern.
   */
  refreshVectorToken: () => Promise<void>;
  
  /**
   * Validates the current session against tenant constraints.
   */
  validateTenant: (requiredTenantId: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      tenantId: null,
      vectorToken: null,
      vectorTokenExpiresAt: null,

      setAuth: (user, token, tenantId) => {
        set({
          user,
          accessToken: token,
          tenantId,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          tenantId: null,
          isAuthenticated: false,
          vectorToken: null,
          vectorTokenExpiresAt: null,
        });
      },

      refreshVectorToken: async () => {
        const { accessToken, tenantId } = get();
        if (!accessToken || !tenantId) return;

        try {
          // In CodeRAG 2026, we exchange the user JWT for an ephemeral vector DB token
          const response = await fetch('/api/auth/workload-identity', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'X-Tenant-ID': tenantId,
            },
            body: JSON.stringify({ scope: 'vector:read-write' }),
          });

          const { token, expiresAt } = await response.json();
          
          set({
            vectorToken: token,
            vectorTokenExpiresAt: expiresAt,
          });
        } catch (error) {
          console.error('Failed to fetch Workload Identity token:', error);
        }
      },

      validateTenant: (requiredTenantId) => {
        const { tenantId } = get();
        // Strict equality check to prevent cross-tenant data leaks
        return tenantId === requiredTenantId;
      },
    }),
    {
      name: 'coderag-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        tenantId: state.tenantId,
      }),
    }
  )
);