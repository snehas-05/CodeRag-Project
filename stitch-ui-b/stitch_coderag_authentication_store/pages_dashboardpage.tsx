import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useHistory } from '../hooks/useHistory';
import { 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  Terminal,
  Filter,
  Loader2
} from 'lucide-react';
import Spinner from '../components/ui/Spinner';

/**
 * CodeRAG 2026 Architecture: DashboardPage
 * 
 * Features:
 * - Paginated history list with useHistory hook.
 * - Real-time search/filtering (Client-side in this demo).
 * - Delete mutation integration with visual feedback.
 * - High-density session cards.
 */

const DashboardPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { 
    items, 
    total, 
    totalPages, 
    isLoading, 
    removeRecord, 
    isDeleting 
  } = useHistory({ page, pageSize: 10 });

  const filteredItems = items.filter(item => 
    item.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this session record? This action cannot be undone.")) {
      await removeRecord(id);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Analytics & History</h1>
            <p className="text-slate-500 text-sm mt-1">Review your recent codebase interactions and RAG sessions.</p>
          </div>

          <div className="flex items-center gap-3">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
               <input 
                 type="text"
                 placeholder="Search sessions..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-cyan-500/50 outline-none w-64 transition-all"
               />
             </div>
             <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                <Filter size={20} />
             </button>
          </div>
        </div>

        {/* Stats Grid (Mock) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: 'Total Queries', value: total, color: 'text-cyan-400' },
             { label: 'Code Blocks Generated', value: total * 4, color: 'text-indigo-400' },
             { label: 'Latency Average', value: '1.2s', color: 'text-emerald-400' },
           ].map((stat, i) => (
             <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
             </div>
           ))}
        </div>

        {/* History List */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
             <span className="text-sm font-bold text-slate-300">Session Records</span>
             <span className="text-[10px] text-slate-500 uppercase font-mono">{total} ITEMS FOUND</span>
          </div>

          <div className="divide-y divide-slate-800/50">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Spinner size="lg" />
                <p className="text-slate-500 animate-pulse font-mono text-xs">Fetching records from tenant...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-24 text-center">
                 <Terminal className="mx-auto text-slate-800 mb-4" size={48} />
                 <p className="text-slate-500">No session history found matching your criteria.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="p-6 hover:bg-slate-800/30 transition-colors group">
                   <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                           <MessageSquare size={18} />
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-sm font-medium text-white truncate mb-1 pr-4">{item.query}</h4>
                           <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1.5 font-mono">
                                 <Clock size={12} />
                                 {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1.5">
                                 <ExternalLink size={12} />
                                 {item.metadata?.repo || 'stitch-ai-core'}
                              </span>
                           </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleDelete(item.id)}
                           disabled={isDeleting}
                           className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Footer */}
          {!isLoading && totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Page <span className="text-slate-300 font-bold">{page}</span> of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                   disabled={page === totalPages}
                   onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                   className="p-2 border border-slate-800 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
