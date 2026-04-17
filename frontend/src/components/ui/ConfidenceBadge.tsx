import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

/**
 * ConfidenceBadge: Visual verification accuracy
 */

interface ConfidenceBadgeProps {
  confidence: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const percentage = Math.round(confidence * 100);
  
  let Config = {
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    label: 'High Accuracy',
    icon: ShieldCheck
  };

  if (confidence < 0.6) {
    Config = {
      color: 'text-rose-400',
      bg: 'bg-rose-400/10',
      border: 'border-rose-400/20',
      label: 'Low Confidence',
      icon: ShieldAlert
    };
  } else if (confidence < 0.8) {
    Config = {
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/20',
      label: 'Moderate',
      icon: Shield
    };
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${Config.bg} ${Config.border} ${Config.color} shadow-sm`}>
       <Config.icon size={14} />
       <span className="text-[10px] font-black uppercase tracking-widest">{Config.label}</span>
       <span className="text-[10px] font-mono opacity-80">{percentage}%</span>
    </div>
  );
};

export default ConfidenceBadge;
