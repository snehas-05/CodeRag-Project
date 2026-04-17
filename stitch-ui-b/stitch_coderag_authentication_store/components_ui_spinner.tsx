import React from 'react';

/**
 * CodeRAG 2026 Architecture: Spinner
 * 
 * Features:
 * - GPU-accelerated CSS animations.
 * - Reusable sizing and color variants.
 * - Dark theme optimized.
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  variant?: 'primary' | 'white';
}

const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className = '', 
  variant = 'primary' 
}) => {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-[3px]',
    xl: 'w-16 h-16 border-4',
  };

  const colorMap = {
    primary: 'border-indigo-500/20 border-t-indigo-500',
    white: 'border-white/20 border-t-white',
  };

  return (
    <div
      className={`
        inline-block 
        animate-spin 
        rounded-full 
        ${sizeMap[size]} 
        ${colorMap[variant]} 
        ${className}
      `}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
