import React from 'react';
import { Bug, FileCode, CheckCircle, Info, ChevronDown, ChevronRight } from 'lucide-react';
import ConfidenceBadge from '../ui/ConfidenceBadge';
import CodeBlock from '../ui/CodeBlock';

/**
 * CodeRAG 2026 Architecture: DebugReport
 * 
 * Features:
 * - Structured bug analysis presentation.
 * - Collapsible evidence blocks for code snippets.
 * - Integration with ConfidenceBadge and CodeBlock.
 * - High-density metadata footer.
 */

export interface DebugReportData {
  rootCause: string;
  confidence: number;
  evidence: {
    file: string;
    snippet: string;
    language: string;
    explanation: string;
  }[];
  suggestedFix: string;
  metadata: {
    latency: string;
    tokens: number;
    model: string;
  };
}

interface DebugReportProps {
  report: DebugReportData;
}

const DebugReport: React.FC<DebugReportProps> = ({ report }) => {
  const [expandedFiles, setExpandedFiles] = React.useState<Record<string, boolean>>({ '0': true });

  const toggleFile = (index: number) => {
    setExpandedFiles(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Root Cause Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Bug size={18} />
            <h3 className="text-sm font-bold uppercase tracking-wider">Root Cause Analysis</h3>
          </div>
          <ConfidenceBadge score={report.confidence} />
        </div>
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-xl p-4 text-slate-300 leading-relaxed">
          {report.rootCause}
        </div>
      </section>

      {/* Evidence Section */}
      <section>
        <div className="flex items-center gap-2 text-slate-400 mb-3">
          <FileCode size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Evidence & Context</h3>
        </div>
        <div className="space-y-3">
          {report.evidence.map((item, idx) => (
            <div key={idx} className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/20">
              <button 
                onClick={() => toggleFile(idx)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-500">{item.file}</span>
                </div>
                {expandedFiles[idx] ? <ChevronDown size={14} className="text-slate-500" /> : <ChevronRight size={14} className="text-slate-500" />}
              </button>
              
              {expandedFiles[idx] && (
                <div className="p-4 pt-0">
                  <p className="text-xs text-slate-400 mb-3 italic">{item.explanation}</p>
                  <CodeBlock code={item.snippet} language={item.language} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Fix Section */}
      <section>
        <div className="flex items-center gap-2 text-emerald-400 mb-3">
          <CheckCircle size={18} />
          <h3 className="text-sm font-bold uppercase tracking-wider">Suggested Resolution</h3>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-slate-200 shadow-[inset_0_0_20px_rgba(16,185,129,0.02)]">
          <div className="prose prose-invert prose-sm max-w-none">
             {report.suggestedFix}
          </div>
        </div>
      </section>

      {/* Metadata Footer */}
      <footer className="flex items-center gap-4 pt-4 border-t border-slate-800/50 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1">
          <Info size={10} />
          <span>MODEL: {report.metadata.model}</span>
        </div>
        <span>LATENCY: {report.metadata.latency}</span>
        <span>TOKENS: {report.metadata.tokens}</span>
      </footer>
    </div>
  );
};

export default DebugReport;