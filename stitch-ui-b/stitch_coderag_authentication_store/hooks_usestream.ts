import { useState, useCallback } from 'react';
import { streamQuery, QueryEvent, QueryStatus } from '../api/query';

/**
 * CodeRAG 2026 Architecture: useStream Hook
 * 
 * Features:
 * - Managed message state for real-time UI updates.
 * - Reactive handling of SSE status events (retrieving, analyzing, etc.).
 * - Automatic accumulation of streamed content.
 * - Robust error handling and cleanup.
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status?: QueryStatus;
  timestamp: string;
}

export const useStream = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<QueryStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (query: string, contextId?: string) => {
    // Reset state for new query
    setError(null);
    setIsStreaming(true);
    setCurrentStatus('retrieving');

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      status: 'retrieving',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    try {
      await streamQuery({
        query,
        contextId,
        onEvent: (event: QueryEvent) => {
          setCurrentStatus(event.status);
          
          setMessages((prev) => 
            prev.map((msg) => {
              if (msg.id === assistantMessageId) {
                return {
                  ...msg,
                  status: event.status,
                  // If the payload contains a text delta (standard SSE pattern), append it
                  content: event.payload?.text 
                    ? msg.content + event.payload.text 
                    : msg.content,
                };
              }
              return msg;
            })
          );

          if (event.status === 'complete') {
            setIsStreaming(false);
          }
        },
        onError: (err) => {
          setError(err.message);
          setIsStreaming(false);
          setCurrentStatus('error');
          
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === assistantMessageId ? { ...msg, status: 'error' } : msg
            )
          );
        },
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setIsStreaming(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentStatus(null);
  }, []);

  return {
    messages,
    isStreaming,
    currentStatus,
    error,
    sendMessage,
    clearMessages,
  };
};
