import React from 'react';

/**
 * CodeRAG 2026 Architecture: ConfidenceBadge
 * 
 * Features:
 * - Conditional styling based on confidence thresholds.
 * - Monospace typography for precision feeling.
 * - Pill-style design.
 */

interface ConfidenceBadgeProps {
  score: number; // 0 to 1
}

const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score }) => {
  const percentage = Math.round(score * 100);
  
  let styles = '';
  let label = '';

  if (score >= 0.8) {
    styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    label = 'High';
  } else if (score >= 0.6) {
    styles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    label = 'Medium';
  } else {
    styles = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    label = 'Low';
  }

  return (
    <div className={`
      inline-flex items-center px-2.5 py-0.5 
      rounded-full text-xs font-mono font-medium 
      border ${styles}
    `}>
      <span className="mr-1.5 opacity-70">{label} Confidence</span>
      <span>{percentage}%</span>
    </div>
  );
};

export default ConfidenceBadge;
