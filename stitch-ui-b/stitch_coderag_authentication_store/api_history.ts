import apiClient from './client';

/**
 * CodeRAG 2026 Architecture: History API
 * 
 * Features:
 * - Integration with centralized Axios client.
 * - Support for paginated query history retrieval.
 * - Resource-specific CRUD operations (GET, DELETE).
 * - Fully typed request/response models.
 */

export interface HistoryItem {
  id: string;
  query: string;
  response: string;
  contextId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PaginatedHistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetHistoryParams {
  page?: number;
  pageSize?: number;
}

/**
 * Retrieves a paginated list of query history for the current tenant.
 */
export const getHistory = async (params: GetHistoryParams = {}): Promise<PaginatedHistoryResponse> => {
  try {
    const response = await apiClient.get<PaginatedHistoryResponse>('/history', {
      params: {
        page: params.page || 1,
        page_size: params.pageSize || 20,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch history:', error);
    throw error;
  }
};

/**
 * Retrieves a specific history record by its unique ID.
 */
export const getHistoryById = async (id: string): Promise<HistoryItem> => {
  try {
    const response = await apiClient.get<HistoryItem>(`/history/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch history record ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a specific history record.
 */
export const deleteHistory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/history/${id}`);
  } catch (error) {
    console.error(`Failed to delete history record ${id}:`, error);
    throw error;
  }
};
