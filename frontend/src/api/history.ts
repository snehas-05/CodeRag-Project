import client from './client';
import { HistoryListResponse, HistoryItem } from '../types';

export async function getHistory(
  page: number,
  pageSize: number
): Promise<HistoryListResponse> {
  const response = await client.get<HistoryListResponse>('/history', {
    params: { page, page_size: pageSize },
  });
  return response.data;
}

export async function getSession(id: number): Promise<HistoryItem> {
  const response = await client.get<HistoryItem>(`/history/${id}`);
  return response.data;
}

export async function deleteSession(id: number): Promise<void> {
  await client.delete(`/history/${id}`);
}
