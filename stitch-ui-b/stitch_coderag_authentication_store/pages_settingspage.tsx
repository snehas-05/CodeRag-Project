import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { 
  Settings as SettingsIcon, 
  Database, 
  Shield, 
  User, 
  Bell, 
  Monitor, 
  Github, 
  Plus, 
  Check,
  RefreshCw
} from 'lucide-react';

/**
 * CodeRAG 2026 Architecture: SettingsPage
 * 
 * Features:
 * - Repository ingestion management.
 * - Multi-tenant security settings.
 * - Theme/Appearance toggle.
 * - Integration with LocalStorage for workspace persistence.
 */

const SettingsPage: React.FC = () => {
  const [repoInput, setRepoInput] = useState('');
  const [activeRepos, setActiveRepos] = useState<string[]>(['google/stitch-ai-core']);
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'glass'>('dark');

  // Load repos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('coderag_repos');
    if (saved) setActiveRepos(JSON.parse(saved));
  }, []);

  const addRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput && !activeRepos.includes(repoInput)) {
      const newList = [...activeRepos, repoInput];
      setActiveRepos(newList);
      localStorage.setItem('coderag_repos', JSON.stringify(newList));
      setRepoInput('');
    }
  };

  const removeRepo = (repo: string) => {
    const newList = activeRepos.filter(r => r !== repo);
    setActiveRepos(newList);
    localStorage.setItem('coderag_repos', JSON.stringify(newList));
  };

  const sections = [
    { id: 'repos', label: 'Repositories', icon: Database },
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-8">
           <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400">
              <SettingsIcon size={24} />
           </div>
           <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Configuration</h1>
              <p className="text-slate-500 mt-1">Manage your analysis environment and workspace preferences.</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {/* Sidebar Navigation (Page-level) */}
           <nav className="space-y-1">
              {sections.map((s) => (
                <button 
                  key={s.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 transition-all text-left"
                >
                  <s.icon size={18} />
                  <span>{s.label}</span>
                </button>
              ))}
           </nav>

           {/* Main Content Areas */}
           <div className="md:col-span-3 space-y-12">
              
              {/* Repository Management */}
              <section id="repos" className="space-y-6">
                 <div>
                    <h3 className="text-lg font-bold text-white mb-2">Ingestion Targets</h3>
                    <p className="text-sm text-slate-500">Repositories analyzed by the RAG engine for your tenant.</p>
                 </div>

                 <form onSubmit={addRepo} className="flex gap-2">
                    <div className="relative flex-1">
                       <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                       <input 
                         type="text"
                         value={repoInput}
                         onChange={(e) => setRepoInput(e.target.value)}
                         placeholder="owner/repository"
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500/50 outline-none"
                       />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                       <Plus size={16} />
                       <span>Add</span>
                    </button>
                 </form>

                 <div className="space-y-2">
                    {activeRepos.map((repo) => (
                       <div key={repo} className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl group hover:border-slate-700 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                                <Github size={16} />
                             </div>
                             <span className="text-sm font-mono text-slate-300">{repo}</span>
                          </div>
                          <button 
                            onClick={() => removeRepo(repo)}
                            className="text-xs font-bold text-slate-600 hover:text-rose-400 transition-colors"
                          >
                            Remove
                          </button>
                       </div>
                    ))}
                 </div>
              </section>

              {/* Preferences Section */}
              <section id="appearance" className="space-y-6 pt-12 border-t border-slate-800/50">
                 <div>
                    <h3 className="text-lg font-bold text-white mb-2">Workspace Preferences</h3>
                    <p className="text-sm text-slate-500">Customize your visual interface and behavior.</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${theme === 'dark' ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                       <div className="flex items-center justify-between mb-2">
                          <Monitor size={20} className={theme === 'dark' ? 'text-cyan-400' : 'text-slate-500'} />
                          {theme === 'dark' && <Check size={16} className="text-cyan-400" />}
                       </div>
                       <p className="text-sm font-bold text-white">Classic Dark</p>
                       <p className="text-xs text-slate-500 mt-1">High contrast slate aesthetic.</p>
                    </button>

                    <button 
                      onClick={() => setTheme('glass')}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${theme === 'glass' ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-800 hover:border-slate-700'}`}
                    >
                       <div className="flex items-center justify-between mb-2">
                          <Monitor size={20} className={theme === 'glass' ? 'text-cyan-400' : 'text-slate-500'} />
                          {theme === 'glass' && <Check size={16} className="text-cyan-400" />}
                       </div>
                       <p className="text-sm font-bold text-white">Cyber Glass</p>
                       <p className="text-xs text-slate-500 mt-1">Premium blur and light effects.</p>
                    </button>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                       <Bell size={18} className="text-slate-500" />
                       <span className="text-sm text-slate-200">Email Notifications for long-running analyses</span>
                    </div>
                    <button 
                      onClick={() => setNotifications(!notifications)}
                      className={`w-12 h-6 rounded-full transition-all relative ${notifications ? 'bg-cyan-500' : 'bg-slate-700'}`}
                    >
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications ? 'left-7' : 'left-1'}`} />
                    </button>
                 </div>
              </section>

              {/* Reset Section */}
              <section className="pt-12 border-t border-slate-800/50">
                 <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                       <h4 className="text-rose-400 font-bold mb-1">Danger Zone</h4>
                       <p className="text-xs text-slate-500">Purge local workspace state and cached repository metadata.</p>
                    </div>
                    <button className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                       <RefreshCw size={16} />
                       <span>Purge Workspace</span>
                    </button>
                 </div>
              </section>

           </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
