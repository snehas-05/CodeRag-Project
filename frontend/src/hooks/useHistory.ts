import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { getHistory, deleteSession as deleteSessionApi } from '../api/history';
import { HistoryListResponse } from '../types';

export function useHistory(
  page: number
): UseQueryResult<HistoryListResponse, Error> {
  return useQuery({
    queryKey: ['history', page],
    queryFn: () => getHistory(page, 10),
    enabled: true,
    staleTime: 30_000,
  });
}

export function useDeleteSession(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSessionApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['history'] }),
  });
}
