import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Bot, Sparkles, Terminal } from 'lucide-react';
import { Message } from '../../types';
import { DebugReport } from './DebugReport';

/**
 * Enhanced Message Bubble Component
 * Features: Markdown rendering, Code Highlighting, Copy Button, Role Icons
 */

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isBot = message.role === 'assistant';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className={`flex w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-400 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] lg:max-w-[75%] gap-3 ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar Area */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
          isBot ? 'bg-accent text-background border border-accent/20' : 'bg-surface border border-border text-text-muted'
        }`}>
          {isBot ? <Bot size={16} strokeWidth={2.5} /> : <User size={16} />}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-1 min-w-0">
          <div className={`flex items-center gap-2 mb-0.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-text-muted/60">
              {isBot ? 'CodeRAG' : 'User'}
            </span>
            {isBot && (
              <div className="flex items-center gap-1 bg-accent/5 border border-accent/10 px-1.5 py-0.5 rounded-md">
                <Sparkles size={9} className="text-accent/70" />
                <span className="text-[9px] font-black text-accent/70 uppercase tracking-tighter">Verified</span>
              </div>
            )}
          </div>

          <div className={`
            px-4 py-3 rounded-xl shadow-lg transition-theme overflow-hidden
            ${isBot 
              ? 'bg-surface-elevated/80 backdrop-blur-sm border border-border text-text-primary rounded-tl-none' 
              : 'bg-accent text-background font-bold rounded-tr-none'}
          `}>
            {isBot ? (
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      
                      return !inline && match ? (
                        <div className="relative group/code my-4 first:mt-1 last:mb-1">
                          <div className="absolute right-2.5 top-2.5 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleCopy(codeString)}
                              className="p-1 px-2 rounded-md bg-background/50 backdrop-blur-md border border-border/50 text-text-muted hover:text-accent hover:border-accent/40 shadow-sm transition-all text-[9px] font-black uppercase"
                              title="Copy code"
                            >
                              {copiedCode === codeString ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between px-3 py-1.5 bg-background/40 border-b border-border/40 rounded-t-lg">
                            <div className="flex items-center gap-2">
                              <Terminal size={11} className="text-accent/60" />
                              <span className="text-[9px] font-black text-text-muted/80 uppercase tracking-widest">{match[1]}</span>
                            </div>
                          </div>

                          <div className="rounded-b-lg overflow-hidden text-[11px]">
                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                borderRadius: '0 0 8px 8px',
                                padding: '1rem',
                                background: 'transparent'
                              }}
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      ) : (
                        <code className={`${className} bg-background/30 px-1.5 py-0.5 rounded text-accent font-black`} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({children}) => <p className="mb-2.5 last:mb-0 leading-relaxed text-[13px]">{children}</p>,
                    h1: ({children}) => <h1 className="text-lg font-black mt-4 mb-2 text-text-primary tracking-tight">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-black mt-3 mb-2 text-text-primary tracking-tight">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-black mt-2 mb-1.5 text-text-primary tracking-tight">{children}</h3>,
                    ul: ({children}) => <ul className="list-disc pl-5 mb-2.5 space-y-0.5 text-[13px]">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal pl-5 mb-2.5 space-y-0.5 text-[13px]">{ol}</ol>,
                    li: ({children}) => <li className="mb-0.5">{children}</li>,
                    blockquote: ({children}) => (
                      <blockquote className="border-l-3 border-accent/30 bg-accent/5 px-3 py-2 my-3 italic text-text-secondary rounded-r-md text-[13px]">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.content}</p>
            )}
            
            {/* If there's a result object, render the full DebugReport */}
            {isBot && message.result && (
              <div className="mt-3 border-t border-border/50 pt-3">
                <DebugReport result={message.result} />
              </div>
            )}
          </div>
          
          {/* Timestamp or Status */}
          <div className={`flex items-center gap-2 mt-0.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
            <span className="text-[9px] text-text-muted font-bold opacity-40">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
