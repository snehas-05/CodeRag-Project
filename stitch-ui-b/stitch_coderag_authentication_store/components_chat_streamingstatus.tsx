import React from 'react';
import { CheckCircle2, Circle, Loader2, AlertCircle } from 'lucide-react';
import { QueryStatus } from '../../api/query';

/**
 * CodeRAG 2026 Architecture: StreamingStatus
 * 
 * Features:
 * - Real-time progress tracking for RAG pipeline.
 * - Terminal-inspired aesthetic with monospace fonts.
 * - Pulsing animations for active states.
 */

interface StreamingStatusProps {
  status: QueryStatus;
}

const steps: { key: QueryStatus; label: string }[] = [
  { key: 'retrieving', label: 'Retrieving context from Vector DB' },
  { key: 'retrieved', label: 'Context retrieval complete' },
  { key: 'analyzing', label: 'Analyzing codebase patterns' },
  { key: 'complete', label: 'Analysis complete' },
];

const StreamingStatus: React.FC<StreamingStatusProps> = ({ status }) => {
  const getStepState = (stepKey: QueryStatus) => {
    if (status === 'error') return 'error';
    
    const statusOrder: QueryStatus[] = ['retrieving', 'retrieved', 'analyzing', 'complete'];
    const currentIndex = statusOrder.indexOf(status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex || status === 'complete') return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 font-mono text-xs mb-6">
      <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        <span className="text-slate-400 uppercase tracking-widest font-bold">Pipeline Status</span>
      </div>
      
      <div className="space-y-3">
        {steps.map((step) => {
          const state = getStepState(step.key);
          
          return (
            <div key={step.key} className={`flex items-center gap-3 transition-opacity duration-300 ${state === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
              {state === 'completed' && <CheckCircle2 size={14} className="text-cyan-400" />}
              {state === 'active' && <Loader2 size={14} className="text-cyan-400 animate-spin" />}
              {state === 'pending' && <Circle size={14} className="text-slate-600" />}
              {state === 'error' && status === step.key && <AlertCircle size={14} className="text-rose-500" />}
              
              <span className={`
                ${state === 'active' ? 'text-white' : 'text-slate-400'}
                ${state === 'error' && status === step.key ? 'text-rose-400' : ''}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StreamingStatus;