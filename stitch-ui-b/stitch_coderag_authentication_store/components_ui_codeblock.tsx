import React, { useState } from 'react';
import { Highlight, themes, Language } from 'prism-react-renderer';
import { Clipboard, Check } from 'lucide-react';

/**
 * CodeRAG 2026 Architecture: CodeBlock
 * 
 * Features:
 * - Prism-based syntax highlighting.
 * - Responsive "Copy" button with visual success feedback.
 * - Language badge.
 * - Line numbering.
 * - Optimized for dark mode developer interfaces.
 */

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'typescript',
  showLineNumbers = true 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="relative group rounded-lg border border-slate-800 bg-slate-950 overflow-hidden my-4 shadow-xl">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
          {language}
        </span>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Clipboard size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="max-h-[500px] overflow-auto custom-scrollbar">
        <Highlight
          theme={themes.vsDark}
          code={code.trim()}
          language={language as Language}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={`${className} p-4 font-mono text-sm leading-relaxed`} style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line, key: i })} className="table-row">
                  {showLineNumbers && (
                    <span className="table-cell text-right pr-4 text-slate-600 select-none text-[10px]">
                      {i + 1}
                    </span>
                  )}
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
};

export default CodeBlock;
