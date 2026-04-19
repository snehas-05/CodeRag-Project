import React, { useRef, useState, useEffect } from 'react';
import { Send, Terminal, Loader2, Sparkles, Command } from 'lucide-react';

/**
 * Chat Input Component
 */

interface ChatInputProps {
  onSend: (query: string, repo: string) => void;
  isLoading: boolean;
  availableRepos: string[];
  selectedRepo: string;
  onRepoChange: (repo: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSend, 
  isLoading, 
  availableRepos, 
  selectedRepo, 
  onRepoChange 
}) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!query.trim() || isLoading || !selectedRepo) return;
    onSend(query.trim(), selectedRepo);
    setQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto w-full group animate-in slide-in-from-bottom-4 duration-500">
      <div className="relative flex flex-col bg-surface/90 backdrop-blur-md border border-border shadow-2xl rounded-2xl overflow-hidden transition-all focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/5">
        
        {/* Repo Selector Bar */}
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/40 bg-background/20">
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-wider">
              <Terminal size={10} />
              <span>Target</span>
           </div>
           
           <select 
             value={selectedRepo}
             onChange={(e) => onRepoChange(e.target.value)}
             className="bg-transparent text-[11px] font-black text-text-secondary outline-none cursor-pointer hover:text-accent transition-colors appearance-none uppercase tracking-tight"
           >
             {!selectedRepo && <option value="">Scope...</option>}
             {availableRepos.map(repo => (
               <option key={repo} value={repo} className="bg-surface">{repo}</option>
             ))}
           </select>

            <div className="ml-auto hidden md:flex items-center gap-1.5 text-text-muted/40 text-[9px] uppercase font-black tracking-widest">
              <Command size={8} />
              <span>Enter</span>
           </div>
        </div>

        {/* Input Area */}
          <div className="flex items-center gap-3 p-2.5 px-4">
           <div className="flex-1 flex flex-col">
             <textarea
               ref={textareaRef}
               rows={1}
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               onKeyDown={handleKeyDown}
               spellCheck="true"
               autoCorrect="on"
               autoCapitalize="sentences"
               placeholder="Analyze codebase architecture..."
               className="w-full bg-transparent border-none outline-none resize-none text-[13px] font-medium leading-normal text-text-primary placeholder:text-text-muted/20 py-1.5 custom-scrollbar"
             />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || !query.trim() || !selectedRepo}
            className={`
              w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all
              ${isLoading || !query.trim() || !selectedRepo 
                ? 'bg-surface-elevated/50 text-text-muted/50 cursor-not-allowed' 
                : 'bg-accent text-background shadow-lg hover:shadow-accent/40 active:scale-95 group/btn'
              }
            `}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <div className="relative">
                <Send size={14} className="transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </div>
            )}
          </button>
        </div>

        {/* Progress Bar (Visible during stream) */}
        <div className="h-[2px] w-full bg-border overflow-hidden">
           <div className={`h-full bg-accent transition-all duration-500 ease-in-out ${isLoading ? 'w-full animate-pulse' : 'w-0'}`} />
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
