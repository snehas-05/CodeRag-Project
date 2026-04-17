import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ChevronDown, Database, Search, Bell } from 'lucide-react';

/**
 * CodeRAG Premium Navbar
 */

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/chat')) return 'AI Debugger';
    if (path === '/dashboard') return 'Analytics';
    if (path === '/settings') return 'Configuration';
    return 'CodeRAG';
  };

  // Static target for now
  const selectedRepo = "CodeRAG Engine (Active)";

  return (
    <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-text-secondary hover:text-text-primary md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-text-primary tracking-tight hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Repo Selector */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-full hover:border-accent/50 transition-colors cursor-pointer group">
          <Database size={14} className="text-accent" />
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-tighter leading-none mb-0.5">
              Knowledge Base
            </span>
            <span className="text-xs text-text-secondary font-mono truncate max-w-[150px]">
              {selectedRepo}
            </span>
          </div>
          <ChevronDown size={14} className="text-text-muted group-hover:text-text-secondary transition-colors" />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-all">
            <Search size={18} />
          </button>
          <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-full transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent border border-background rounded-full" />
          </button>
        </div>

        {/* Mobile Indicator */}
        <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/20 text-accent">
           <Database size={14} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
