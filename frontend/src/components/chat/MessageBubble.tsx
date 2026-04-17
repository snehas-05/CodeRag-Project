import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { Message } from '../../hooks/useStream';
import { StreamingStatus } from './StreamingStatus';
import { DebugReport } from './DebugReport';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

/**
 * MessageBubble: Premium Chat Interaction
 * 
 * Logic to handle both text streaming and structured DebugResult objects.
 */

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  
  const renderContent = () => {
    if (isUser) {
      return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
    }

    // Assistant logic: Show status if streaming, then content (Markdown), then Report if available
    return (
      <div className="space-y-4">
        {message.status && message.status !== 'complete' && isLast && (
           <StreamingStatus message={message.status === 'retrieving' ? 'Retrieving codebase context...' : 'Analyzing patterns...'} />
        )}
        
        {message.content && <MarkdownRenderer content={message.content} />}
        
        {message.result && <DebugReport result={message.result} />}
      </div>
    );
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
      <div className={`flex gap-4 max-w-[95%] md:max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Area */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg border transition-all ${
          isUser 
            ? 'bg-surface-elevated border-border text-text-secondary' 
            : 'bg-accent border-accent/20 text-background'
        }`}>
          {isUser ? <User size={20} /> : <Sparkles size={20} />}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-2">
          <div className={`flex items-center gap-3 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
             <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
               {isUser ? 'You' : 'CodeRAG Assistant'}
             </span>
             <span className="text-[10px] text-text-muted font-mono opacity-60">
               {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          </div>

          <div className={`
            px-5 py-4 rounded-3xl text-sm shadow-xl transition-all border
            ${isUser 
              ? 'bg-accent text-background border-accent/20 rounded-tr-none' 
              : 'bg-surface border-border text-white rounded-tl-none'
            }
          `}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
