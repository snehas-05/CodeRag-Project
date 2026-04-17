export interface User {
  user_id: number;
  email: string;
  access_token: string;
}

export interface EvidenceItem {
  file_path: string;
  start_line: number;
  end_line: number;
  content: string;
  name: string;
}

export interface DebugResult {
  root_cause: string | null;
  suggested_fix: string | null;
  evidence: EvidenceItem[];
  confidence: number; // 0.0 to 1.0
  iterations: number;
  hypothesis_chain: string[];
  session_id: number;
}

export interface StreamEvent {
  status: 'retrieving' | 'retrieved' | 'analyzing' | 'complete' | 'error';
  message?: string;
  chunks?: number;
  result?: DebugResult;
  session_id?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  result?: DebugResult;
  timestamp: Date;
  isStreaming?: boolean;
  streamingStatus?: string;
}

export interface HistoryItem {
  id: number;
  query: string;
  response: DebugResult;
  created_at: string;
}

export type ThemeMode = 'dark' | 'light';