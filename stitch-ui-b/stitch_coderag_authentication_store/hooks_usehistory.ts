import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHistory, deleteHistory, GetHistoryParams, HistoryItem } from '../api/history';

/**
 * CodeRAG 2026 Architecture: useHistory Hook
 * 
 * Features:
 * - React Query integration for performant caching.
 * - Pagination support via query keys.
 * - Mutation logic for deleting records with cache invalidation.
 * - Type-safe implementation.
 */

export const useHistory = (params: GetHistoryParams = { page: 1, pageSize: 20 }) => {
  const queryClient = useQueryClient();

  // 1. Fetch Paginated History
  const historyQuery = useQuery({
    queryKey: ['history', params.page, params.pageSize],
    queryFn: () => getHistory(params),
    placeholderData: (previousData) => previousData, // Smooth pagination transitions
  });

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteHistory(id),
    onSuccess: () => {
      // Invalidate all history queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });

  // Helper for direct deletion calls
  const removeRecord = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete history record:', error);
      throw error;
    }
  };

  return {
    // Data & Loading State
    items: historyQuery.data?.items || [],
    total: historyQuery.data?.total || 0,
    totalPages: historyQuery.data?.totalPages || 0,
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    error: historyQuery.error,

    // Mutation State
    isDeleting: deleteMutation.isPending,
    
    // Actions
    refresh: () => historyQuery.refetch(),
    removeRecord,
  };
};
