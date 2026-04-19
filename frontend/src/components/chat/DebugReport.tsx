import React, { useState } from 'react';
import { 
  Bug, 
  Wrench, 
  ChevronDown, 
  ChevronUp, 
  FileCode, 
  Search, 
  Share2, 
  History,
  FileText
} from 'lucide-react';
import { DebugResult } from '../../types';
import { CodeBlock } from '../ui/CodeBlock';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';
import { MarkdownRenderer } from '../ui/MarkdownRenderer';

/**
 * DebugReport: High-fidelity analysis visualization
 */

export const DebugReport: React.FC<{ result: DebugResult }> = ({ result }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="space-y-5 mt-4 animate-in fade-in slide-in-from-top-4 duration-700">
      
      {/* Primary Goal / Root Cause */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/10 to-orange-500/10 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="px-4 py-2.5 border-b border-border bg-gradient-to-r from-rose-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-rose-500/10 rounded-lg text-rose-500 border border-rose-500/20">
                <Bug size={16} />
              </div>
              <h3 className="font-black text-text-primary uppercase tracking-[0.08em] text-[11px]">
                {result.intent === 'REPO_LEVEL' ? 'Repository Overview' : 'Root Cause analysis'}
              </h3>
            </div>
            <ConfidenceBadge confidence={result.confidence} />
          </div>
          <div className="p-4 px-5">
            <MarkdownRenderer content={result.root_cause} />
          </div>
        </div>
      </div>

      {/* Suggested Solution */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
        <div className="relative bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="px-4 py-2.5 border-b border-border bg-gradient-to-r from-emerald-500/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                <Wrench size={16} />
              </div>
              <h3 className="font-black text-text-primary uppercase tracking-[0.08em] text-[11px]">
                {result.intent === 'REPO_LEVEL' ? 'Strategic Context' : 'Remediation Strategy'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
               <button className="p-1.5 hover:bg-surface-elevated rounded-md text-text-muted transition-colors">
                  <Share2 size={14} />
               </button>
            </div>
          </div>
          <div className="p-4 px-5">
            <MarkdownRenderer content={result.suggested_fix} />
          </div>
        </div>
      </div>

      {/* Evidence Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1.5">
           <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-accent/10 rounded-lg text-accent border border-accent/20">
                <FileCode size={16} />
              </div>
              <h3 className="font-black text-text-primary uppercase tracking-[0.08em] text-[11px]">Supporting Evidence</h3>
           </div>
           <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest">{result.evidence.length} References</span>
        </div>

        <div className="evidence-grid space-y-2">
          {result.evidence.map((item, idx) => (
            <div 
              key={idx} 
              className={`
                bg-surface-elevated/40 border border-border rounded-xl overflow-hidden transition-all duration-300
                ${expandedIndex === idx ? 'ring-2 ring-accent/20 border-accent/20 shadow-xl' : 'hover:border-text-muted/20 shadow-sm'}
              `}
            >
              <button 
                onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-3 px-4 text-left"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                   <div className={`p-1.5 rounded-md transition-colors ${expandedIndex === idx ? 'bg-accent text-background' : 'bg-background text-text-muted'}`}>
                      <FileText size={14} />
                   </div>
                   <div className="flex flex-col truncate">
                      <span className="text-[11px] font-bold font-mono text-text-primary truncate">{item.file_path}</span>
                      <span className="text-[9px] text-text-muted/70 font-mono uppercase font-black">Line {item.start_line}-{item.end_line}</span>
                   </div>
                </div>
                {expandedIndex === idx ? <ChevronUp size={14} className="text-accent" /> : <ChevronDown size={14} className="text-text-muted" />}
              </button>
              
              {expandedIndex === idx && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300">
                   <CodeBlock code={item.content} language="typescript" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reasoning History Toggle */}
      {result.hypothesis_chain && result.hypothesis_chain.length > 0 && (
         <div className="pt-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface-elevated/50 hover:bg-surface transition-all text-[9px] font-black uppercase tracking-[0.1em] text-text-secondary"
            >
              <History size={12} className={showHistory ? 'text-accent' : ''} />
              {showHistory ? 'Hide Path' : `View ${result.hypothesis_chain.length} Logic Steps`}
            </button>
            
            {showHistory && (
              <div className="mt-3 p-4 rounded-2xl bg-surface-elevated/20 border border-border border-dashed space-y-3 animate-in fade-in zoom-in duration-500">
                <div className="flex items-center gap-2 mb-2">
                   <Search size={12} className="text-accent/70" />
                   <h4 className="text-[9px] font-black uppercase tracking-widest text-text-muted/60">Analysis Trajectory</h4>
                </div>
                {result.hypothesis_chain.map((h, i) => (
                  <div key={i} className="flex gap-3 relative">
                    <div className="absolute left-[5.5px] top-4 bottom-0 w-px bg-border group-last:hidden" />
                    <div className="w-3 h-3 rounded-full bg-accent/80 border-2 border-background shrink-0 z-10" />
                    <p className="text-[11px] text-text-secondary leading-relaxed pb-4 last:pb-0">{h}</p>
                  </div>
                ))}
              </div>
            )}
         </div>
      )}
    </div>
  );
};

export default DebugReport;
