import { useAuthStore } from '../store/authStore';

/**
 * CodeRAG 2026 Architecture: Query API
 * 
 * Features:
 * - Native fetch implementation for streaming support.
 * - SSE (Server-Sent Events) logic with manual chunk buffering.
 * - Integration with AuthStore for Bearer and Workload Identity tokens.
 */

export type QueryStatus = 'retrieving' | 'retrieved' | 'analyzing' | 'complete' | 'error';

export interface QueryEvent {
  status: QueryStatus;
  payload?: any;
  message?: string;
  timestamp: string;
}

export interface StreamQueryOptions {
  query: string;
  contextId?: string;
  onEvent: (event: QueryEvent) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

const baseURL = import.meta.env.VITE_API_URL || 'https://api.coderag.ai/v1';

/**
 * streamQuery
 * Executes a RAG query and streams the progress/results via SSE.
 */
export const streamQuery = async ({
  query,
  contextId,
  onEvent,
  onError,
  signal,
}: StreamQueryOptions): Promise<void> => {
  const { accessToken, tenantId, vectorToken } = useAuthStore.getState();

  try {
    const response = await fetch(`${baseURL}/query/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Tenant-ID': tenantId || '',
        'X-Vector-Token': vectorToken || '', // Workload Identity for vector DB access
      },
      body: JSON.stringify({ query, contextId }),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Query failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is null, streaming not supported.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // Append new chunk to buffer
      buffer += decoder.decode(value, { stream: true });

      // Split buffer by lines to process SSE events
      const lines = buffer.split('\n');
      
      // Keep the last partial line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // SSE protocol: ignore empty lines and comments
        if (!trimmedLine || trimmedLine.startsWith(':')) continue;

        // Detect "data: " prefix
        if (trimmedLine.startsWith('data: ')) {
          const jsonString = trimmedLine.replace('data: ', '');
          
          try {
            const event: QueryEvent = JSON.parse(jsonString);
            onEvent(event);

            if (event.status === 'error') {
              throw new Error(event.message || 'Stream encountered an error');
            }
          } catch (parseError) {
            console.error('Failed to parse SSE event:', parseError, jsonString);
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Query stream aborted by user.');
      return;
    }
    
    if (onError) {
      onError(error);
    } else {
      onEvent({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
};
