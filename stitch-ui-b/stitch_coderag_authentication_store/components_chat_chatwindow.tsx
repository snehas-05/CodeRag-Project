import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useStream } from '../../hooks/useStream';
import { Terminal, Cpu, Zap, ShieldCheck } from 'lucide-react';

/**
 * CodeRAG 2026 Architecture: ChatWindow
 * 
 * Features:
 * - Central orchestrator for the AI Assistant view.
 * - Empty state with suggested query cards.
 * - Auto-scrolling message list.
 * - Integration with useStream for real-time interaction.
 */

const ChatWindow: React.FC = () => {
  const { messages, isStreaming, sendMessage } = useStream();
  const scrollRef = useRef<HTMLDivElement>(null);

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
    { icon: Terminal, title: "Debug Panic", text: "Explain the root cause of the crash in store/authStore.ts" },
    { icon: Cpu, title: "Analyze Flow", text: "How does the SSE streaming logic work in api/query.ts?" },
    { icon: Zap, title: "Refactor Hook", text: "Optimize hooks/useHistory.ts for better performance" },
    { icon: ShieldCheck, title: "Security Audit", text: "Check ProtectedRoute.tsx for potential bypass vulnerabilities" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] relative">
      {/* Message Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar scroll-smooth"
      >
        <div className="max-w-4xl mx-auto w-full">
          {messages.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 animate-pulse">
                <Terminal className="text-cyan-400" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">How can I help you today?</h2>
              <p className="text-slate-400 text-center max-w-md mb-12">
                Ask anything about your codebase. CodeRAG uses workload identity to securely analyze your target repository.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.text)}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-cyan-500/30 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 mb-2 text-cyan-400">
                      <s.icon size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{s.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                      {s.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isLast={idx === messages.length - 1} 
              />
            ))
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
        <ChatInput 
          onSend={(query) => sendMessage(query)} 
          isLoading={isStreaming} 
          selectedRepo="google/stitch-ai-core"
        />
      </div>
    </div>
  );
};

export default ChatWindow;