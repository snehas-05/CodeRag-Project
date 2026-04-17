import React from 'react';
import { Loader2, Activity } from 'lucide-react';

/**
 * StreamingStatus: AI Reasoning Indicator
 */

interface StreamingStatusProps {
  message: string | null;
}

export const StreamingStatus: React.FC<StreamingStatusProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-accent/5 border border-accent/10 rounded-2xl w-fit animate-in fade-in zoom-in duration-300">
      <div className="relative flex items-center justify-center">
         <Loader2 className="w-4 h-4 text-accent animate-spin" />
         <Activity className="w-2 h-2 text-accent absolute" />
      </div>
      <span className="text-xs font-bold text-accent uppercase tracking-widest">{message}</span>
    </div>
  );
};

export default StreamingStatus;
