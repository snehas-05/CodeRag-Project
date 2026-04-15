import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, MessageSquare, LayoutDashboard, Settings, Code } from 'lucide-react';
import { useHistory } from '../../hooks/useHistory';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: historyData } = useHistory(1);
  const recentSessions = historyData?.items.slice(0, 5) || [];

  const navItems = [
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:relative w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 transition-transform duration-300 z-40 flex flex-col overflow-y-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 pt-8 md:pt-0">
          <Code className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            CodeRAG
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2 mb-8">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Recent Sessions */}
        <div>
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 upcase mb-3">
            Recent Sessions
          </h3>
          <div className="space-y-2">
            {recentSessions.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No sessions yet
              </p>
            ) : (
              recentSessions.map((session) => (
                <NavLink
                  key={session.id}
                  to={`/chat?session=${session.id}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition truncate"
                  title={session.query}
                >
                  {session.query.substring(0, 40)}...
                </NavLink>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
