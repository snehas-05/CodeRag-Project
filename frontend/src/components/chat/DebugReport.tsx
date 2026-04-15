import { useState } from 'react';
import { ChevronDown, ChevronUp, Bug, FileText, Wrench } from 'lucide-react';
import { DebugResult } from '../../types';
import { CodeBlock } from '../ui/CodeBlock';
import { ConfidenceBadge } from '../ui/ConfidenceBadge';

export function DebugReport({ result }: { result: DebugResult }) {
  const [expandedEvidenceIndex, setExpandedEvidenceIndex] = useState<
    number | null
  >(null);
  const [showHypotheses, setShowHypotheses] = useState(false);

  const toggleEvidence = (index: number) => {
    setExpandedEvidenceIndex(
      expandedEvidenceIndex === index ? null : index
    );
  };

  return (
    <div className="space-y-4 mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700">
      {/* Root Cause */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Bug className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Root Cause
          </h3>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded text-gray-800 dark:text-gray-200">
          {result.root_cause || 'Not determined'}
        </div>
      </div>

      {/* Evidence */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Evidence ({result.evidence.length} file{result.evidence.length !== 1 ? 's' : ''})
          </h3>
        </div>
        <div className="space-y-2">
          {result.evidence.map((item, idx) => (
            <div key={idx} className="border border-gray-300 dark:border-gray-600 rounded">
              <button
                onClick={() => toggleEvidence(idx)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {item.file_path} ({item.start_line}-{item.end_line})
                </span>
                {expandedEvidenceIndex === idx ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {expandedEvidenceIndex === idx && (
                <div className="p-2 bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-600">
                  <CodeBlock code={item.content} language="python" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Fix */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Wrench className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Suggested Fix
          </h3>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-3 rounded text-gray-800 dark:text-gray-200">
          {result.suggested_fix || 'Not available'}
        </div>
      </div>

      {/* Metadata */}
      <div className="pt-2 border-t border-gray-300 dark:border-gray-600 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Ran {result.iterations} reasoning iteration
            {result.iterations !== 1 ? 's' : ''}
          </span>
          <ConfidenceBadge confidence={result.confidence} />
        </div>

        {/* Collapsible Hypothesis Chain */}
        {result.hypothesis_chain.length > 0 && (
          <div>
            <button
              onClick={() => setShowHypotheses(!showHypotheses)}
              className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showHypotheses ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Hypothesis chain ({result.hypothesis_chain.length})
            </button>
            {showHypotheses && (
              <ol className="mt-2 ml-4 space-y-1 list-decimal list-inside text-sm text-gray-700 dark:text-gray-300">
                {result.hypothesis_chain.map((h, idx) => (
                  <li key={idx}>{h}</li>
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
