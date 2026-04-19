import React, { useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ChatWindow from '../components/chat/ChatWindow';
import { Terminal, Shield, Workflow } from 'lucide-react';

/**
 * Chat Workspace
 */

export const ChatPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Chat | CodeRAG';
  }, []);

  return (
    <div className="flex flex-col h-full space-y-1.5 animate-in fade-in duration-700">
      {/* Page Header / Context Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-accent/10 rounded-md text-accent border border-accent/20">
            <Workflow size={14} />
          </div>
          <div>
            <h2 className="text-[11px] font-black text-text-primary uppercase tracking-[0.1em]">Chat Workspace</h2>
            <p className="text-[9px] text-text-muted font-bold -mt-1">Session isolation active</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-elevated/50 border border-border rounded-full text-[8px] text-accent/70 font-black tracking-wider shadow-sm">
          <Shield size={9} />
          <span>SECURE</span>
        </div>
      </div>

      {/* The Chat Interface */}
      <div className="flex-1 bg-surface-elevated/20 border border-border rounded-2xl overflow-hidden shadow-xl backdrop-blur-sm">
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
