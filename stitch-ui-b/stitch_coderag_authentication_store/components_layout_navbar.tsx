import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ChevronDown, Database, Search, Bell } from 'lucide-react';

/**
 * CodeRAG 2026 Architecture: Navbar
 * 
 * Features:
 * - Dynamic title based on current route.
 * - Repo selection interface (Placeholder UI).
 * - Glassmorphism design with blur effects.
 * - Responsive mobile menu trigger.
 */

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/chat')) return 'AI Assistant';
    if (path === '/dashboard') return 'Analytics';
    if (path === '/settings') return 'Configuration';
    return 'CodeRAG';
  };

  // Mock repo - in production this would come from a RepositoryStore
  const selectedRepo = "google/stitch-ai-core";

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-400 hover:text-white md:hidden"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-white tracking-tight hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Repo Selector - Desktop focus */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full hover:border-cyan-500/50 transition-colors cursor-pointer group">
          <Database size={14} className="text-cyan-400" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter leading-none mb-0.5">
              Target Repo
            </span>
            <span className="text-xs text-slate-200 font-mono truncate max-w-[150px]">
              {selectedRepo || "No repo selected"}
            </span>
          </div>
          <ChevronDown size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all">
            <Search size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 border border-slate-950 rounded-full" />
          </button>
        </div>

        {/* Mobile active repo indicator (compact) */}
        {selectedRepo && (
           <div className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Database size={14} />
           </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
