import React, { useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useStream } from '../../hooks/useStream';
import { Terminal, Cpu, Zap, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { getAvailableRepos } from '../../api/query';
import { getSession } from '../../api/history';

/**
 * AI Debugger Workspace: ChatWindow
 */

export const ChatWindow: React.FC = () => {
  const { messages, isStreaming, sendMessage, setMessages } = useStream();
  const [searchParams] = useSearchParams();
  const [availableRepos, setAvailableRepos] = React.useState<string[]>([]);
  const [selectedRepo, setSelectedRepo] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load available repositories for context selection
  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const repos = await getAvailableRepos();
        setAvailableRepos(repos);
        if (repos.length > 0) setSelectedRepo(repos[0]);
      } catch (err) {
        console.error('Failed to load repositories for workspace:', err);
      }
    };
    fetchRepos();
  }, []);

  // Handle session loading from History
  useEffect(() => {
    const sessionId = searchParams.get('session');
    if (sessionId) {
      const loadSession = async () => {
        try {
          const session = await getSession(parseInt(sessionId));
          if (session) {
            setMessages([
              {
                id: `user-${session.id}`,
                role: 'user',
                content: session.query,
                timestamp: session.created_at,
              },
              {
                id: `assistant-${session.id}`,
                role: 'assistant',
                content: '',
                status: 'complete',
                timestamp: session.created_at,
                result: session.response,
              }
            ]);
          }
        } catch (err) {
          console.error('Failed to load session:', err);
        }
      };
      loadSession();
    }
  }, [searchParams, setMessages]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const suggestions = [
    { icon: Terminal, title: "Debug Panic", text: "Explain why the backend is throwing a 401 on /api/query" },
    { icon: Cpu, title: "Analyze Flow", text: "How does the SSE streaming bridge data to the UI?" },
    { icon: Zap, title: "Refactor Store", text: "Propose a more efficient way to handle auth state in Zustand" },
    { icon: ShieldCheck, title: "Security Audit", text: "Are there any vulnerabilities in the token handling logic?" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] relative">
      {/* Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar scroll-smooth"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6 animate-pulse">
                <Terminal className="text-accent" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Code Analysis Ready</h2>
              <p className="text-text-secondary text-center max-w-md mb-12 font-medium">
                Connected to secure analysis engine. Zero-trust workload identity active.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text, selectedRepo)}
                    disabled={!selectedRepo}
                    className="p-4 rounded-xl border border-border bg-surface-elevated/50 hover:bg-surface-elevated hover:border-accent/30 transition-all text-left group shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2 mb-2 text-accent">
                      <s.icon size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{s.title}</span>
                    </div>
                    <p className="text-xs text-text-secondary group-hover:text-text-primary transition-colors">
                      {s.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => (
                <MessageBubble 
                  key={msg.id} 
                  message={msg} 
                  isLast={idx === messages.length - 1} 
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-background via-background/90 to-transparent">
        <ChatInput 
          onSend={(query, repo) => sendMessage(query, repo)} 
          isLoading={isStreaming} 
          availableRepos={availableRepos}
          selectedRepo={selectedRepo}
          onRepoChange={setSelectedRepo}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
