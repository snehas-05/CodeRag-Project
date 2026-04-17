import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { Message } from '../../hooks/useStream';
import StreamingStatus from './StreamingStatus';
import DebugReport, { DebugReportData } from './DebugReport';

/**
 * CodeRAG 2026 Architecture: MessageBubble
 * 
 * Features:
 * - Differentiated styling for User vs Assistant.
 * - Assistant responses are rendered as high-fidelity cards.
 * - Integration with StreamingStatus and DebugReport.
 * - Automatic parsing of structured JSON data within messages.
 */

interface MessageBubbleProps {
  message: Message;
  isLast?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast }) => {
  const isUser = message.role === 'user';
  
  // Logic to detect and parse debug reports from the assistant
  const renderContent = () => {
    if (isUser) return <p className="whitespace-pre-wrap">{message.content}</p>;

    // Attempt to parse structured report if the message looks like JSON
    if (message.content.trim().startsWith('{') && message.content.trim().endsWith('}')) {
      try {
        const reportData: DebugReportData = JSON.parse(message.content);
        return <DebugReport report={reportData} />;
      } catch (e) {
        // Fallback to text if parsing fails
        return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
      }
    }

    return (
      <div className="space-y-4">
        {message.status && message.status !== 'complete' && isLast && (
           <StreamingStatus status={message.status} />
        )}
        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar Area */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg ${
          isUser ? 'bg-slate-700' : 'bg-cyan-600'
        }`}>
          {isUser ? <User size={18} className="text-slate-300" /> : <Sparkles size={18} className="text-white" />}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 px-1">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
               {isUser ? 'Requester' : 'CodeRAG Engine'}
             </span>
             <span className="text-[10px] text-slate-600 font-mono">
               {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
          </div>

          <div className={`
            px-4 py-3 rounded-2xl text-sm
            ${isUser 
              ? 'bg-cyan-500 text-white shadow-[0_4px_15px_rgba(6,182,212,0.2)]' 
              : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-xl'
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