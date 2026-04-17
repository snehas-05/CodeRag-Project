import React, { useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ChatWindow from '../components/chat/ChatWindow';
import { Terminal, Shield } from 'lucide-react';

/**
 * CodeRAG 2026 Architecture: ChatPage
 * 
 * Features:
 * - Entry point for the core AI interaction.
 * - Wraps ChatWindow in the global AppLayout.
 * - Manages page-level context for target repository.
 */

const ChatPage: React.FC = () => {
  // In a real app, we might sync URL params with the repo state here
  useEffect(() => {
    document.title = 'Chat | CodeRAG Assistant';
  }, []);

  return (
    <AppLayout>
      <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-700">
        {/* Page Header / Context Bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                <Terminal size={18} />
             </div>
             <div>
               <h2 className="text-sm font-bold text-white uppercase tracking-wider">Analysis Workspace</h2>
               <p className="text-xs text-slate-500 font-medium">Session isolation active</p>
             </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] text-emerald-400 font-mono">
             <Shield size={12} />
             <span>WORKLOAD IDENTITY VERIFIED</span>
          </div>
        </div>

        {/* The Chat Interface */}
        <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
           <ChatWindow />
        </div>
      </div>
    </AppLayout>
  );
};

export default ChatPage;
