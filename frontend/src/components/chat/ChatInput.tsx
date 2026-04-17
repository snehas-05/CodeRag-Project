import React, { useRef, useState, useEffect } from 'react';
import { Send, Terminal, Loader2, Sparkles, Command } from 'lucide-react';
interface ChatInputProps {
  onSend: (query: string, repo: string) => void;
  isLoading: boolean;
  availableRepos: string[];
  selectedRepo: string;
  onRepoChange: (repo: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
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
    <div className="max-w-4xl mx-auto w-full group">
      <div className="relative flex flex-col bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden transition-all focus-within:border-accent/40 focus-within:ring-4 focus-within:ring-accent/5">
        
        {/* Repo Selector Bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-background/50">
           <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
              <Terminal size={12} />
              <span>Target Context</span>
           </div>
           
           <select 
             value={selectedRepo}
             onChange={(e) => onRepoChange(e.target.value)}
             className="bg-transparent text-xs font-mono text-text-secondary outline-none cursor-pointer hover:text-text-primary transition-colors pr-8"
           >
             {!selectedRepo && <option value="">Select scope...</option>}
             {availableRepos.map(repo => (
               <option key={repo} value={repo}>{repo}</option>
             ))}
           </select>

           <div className="ml-auto flex items-center gap-2 text-text-muted text-[10px] uppercase font-bold tracking-tighter opacity-40">
              <Command size={10} />
              <span>Enter to Send</span>
           </div>
        </div>

        {/* Input Area */}
        <div className="flex items-end gap-2 p-4 pt-4">
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI agent to debug, architectural review or explain code..."
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-text-primary placeholder:text-text-muted/50 py-2 custom-scrollbar"
          />
          
          <button
            onClick={handleSubmit}
            disabled={isLoading || !query.trim() || !selectedRepo}
            className={`
              w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all
              ${isLoading || !query.trim() || !selectedRepo 
                ? 'bg-surface-elevated text-text-muted cursor-not-allowed opacity-50' 
                : 'bg-accent text-background shadow-[0_4px_15px_rgba(var(--accent-rgb),0.3)] hover:scale-110 active:scale-95'
              }
            `}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>

        {/* Dynamic Sparkle Line */}
        <div className={`h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 transition-transform duration-1000 ${isLoading ? 'translate-x-0 animate-pulse' : 'translate-y-1'}`} />
      </div>
    </div>
  );
};

export default ChatInput;
