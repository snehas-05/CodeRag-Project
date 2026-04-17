import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronRight,
  Code2,
  Terminal,
  History
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useHistory } from '../../hooks/useHistory';

/**
 * CodeRAG 2026 Architecture: Sidebar
 * 
 * Features:
 * - Multi-mode: Desktop (Full), Tablet (Icon-only), Mobile (Drawer).
 * - Dynamic session history (Last 5).
 * - Active route styling with cyan accents.
 * - Integrated logout with Zustand store.
 */

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { clearAuth, user } = useAuthStore();
  const { items } = useHistory({ page: 1, pageSize: 5 });
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out
      md:translate-x-0 md:static md:w-20 lg:w-64
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex flex-col h-full">
        {/* Branding */}
        <div className="h-16 flex items-center px-6 md:justify-center lg:justify-start border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Code2 className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight text-white md:hidden lg:block">
              Code<span className="text-cyan-400">RAG</span>
            </span>
          </div>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                md:justify-center lg:justify-start
                ${isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'}
              `}
            >
              <link.icon size={20} className="shrink-0" />
              <span className="font-medium text-sm md:hidden lg:block">{link.name}</span>
              {location.pathname === link.path && (
                <div className="ml-auto w-1 h-4 bg-cyan-500 rounded-full md:hidden lg:block" />
              )}
            </NavLink>
          ))}

          {/* Sessions Section - Desktop/Mobile Only */}
          <div className="mt-8 pt-8 border-t border-slate-800 md:hidden lg:block">
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Recent Sessions
              </span>
              <History size={12} className="text-slate-600" />
            </div>
            <div className="space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(`/chat/${item.id}`)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-cyan-400 hover:bg-slate-800/40 rounded-md transition-colors text-left group"
                >
                  <Terminal size={14} className="shrink-0 opacity-50 group-hover:opacity-100" />
                  <span className="truncate">{item.query}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 md:justify-center lg:justify-start lg:mb-4">
             <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 overflow-hidden shrink-0">
               {user?.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                   {user?.name?.charAt(0)}
                 </div>
               )}
             </div>
             <div className="min-w-0 md:hidden lg:block">
               <p className="text-sm font-medium text-white truncate">{user?.name}</p>
               <p className="text-[10px] text-slate-500 truncate lowercase">{user?.provider} identity</p>
             </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all md:justify-center lg:justify-start group"
          >
            <LogOut size={20} className="shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium text-sm md:hidden lg:block">Log Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
