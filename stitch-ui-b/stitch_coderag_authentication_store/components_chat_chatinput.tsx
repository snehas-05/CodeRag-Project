import React, { useState, useRef, useEffect } from 'react';
import { Send, Command, CornerDownLeft, Database } from 'lucide-react';

/**
 * CodeRAG 2026 Architecture: ChatInput
 * 
 * Features:
 * - Auto-expanding textarea based on content.
 * - Smart keybinding (Ctrl+Enter to send).
 * - Visual indicators for target repository.
 * - Disabled states during streaming to prevent race conditions.
 */

interface ChatInputProps {
  onSend: (query: string) => void;
  isLoading: boolean;
  selectedRepo?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, selectedRepo }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full group">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden focus-within:border-cyan-500/50 transition-all">
        {/* Repo Context Bar */}
        <div className="px-4 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2">
           <Database size={12} className="text-cyan-500" />
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Querying:</span>
           <span className="text-[10px] font-mono text-slate-300 truncate max-w-[200px]">
             {selectedRepo || 'Select a repository to begin...'}
           </span>
        </div>

        <div className="flex items-end gap-2 p-2 px-4">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask CodeRAG to analyze a bug, explain logic, or refactor code..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 placeholder:text-slate-500 resize-none py-3 min-h-[44px] max-h-[200px] custom-scrollbar"
            disabled={isLoading}
          />

          <div className="flex items-center gap-2 pb-1.5">
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`
                p-2 rounded-xl transition-all duration-200
                ${input.trim() && !isLoading 
                  ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
              `}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Shortcuts Hint */}
        <div className="px-4 py-2 bg-slate-950/30 flex items-center justify-between">
           <div className="flex gap-4">
             <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-800">
                  <Command size={8} />
                  <span>Enter</span>
                </div>
                <span>to send</span>
             </div>
             <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-slate-800">
                  <CornerDownLeft size={8} />
                  <span>Enter</span>
                </div>
                <span>for new line</span>
             </div>
           </div>
           
           <div className="text-[10px] text-slate-500 italic">
             CodeRAG 2026 Engine v1.2.4
           </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;