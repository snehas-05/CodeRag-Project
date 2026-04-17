import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * CodeRAG 2026 Architecture: AppLayout
 * 
 * Features:
 * - Responsive 3-panel layout (Sidebar, Navbar, Content).
 * - Mobile drawer management.
 * - Persistent navigation across protected routes.
 * - Smooth CSS transitions for layout shifts.
 */

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar - Desktop & Tablet */}
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={toggleMobileMenu} />
        
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          {/* Subtle background glow for premium feel */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-4 py-6 md:px-8 max-w-7xl relative z-10">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AppLayout;
