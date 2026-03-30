import React, { useState, useCallback, useMemo } from 'react';
import { CopyIcon, CheckIcon } from '../../../components/Icons';

interface DataRendererProps {
  data: unknown;
}

/**
 * Renders JSON/structured data with syntax highlighting and copy support.
 * Follows the CodeBlockWithCopy pattern for consistent styling.
 */
export const DataRenderer: React.FC<DataRendererProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const formatted = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const lineCount = useMemo(() => formatted.split('\n').length, [formatted]);
  const isLarge = lineCount > 20;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  }, [formatted]);

  // For large outputs, default to collapsed
  const displayText =
    isLarge && isCollapsed ? formatted.split('\n').slice(0, 10).join('\n') + '\n  ...' : formatted;

  return (
    <div className="mt-1 relative group">
      <pre className="bg-copilot-bg rounded p-2 overflow-x-auto text-[10px] max-w-full max-h-64 overflow-y-auto">
        <code className="text-copilot-text whitespace-pre">{displayText}</code>
      </pre>
      <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all duration-150">
        {isLarge && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded bg-copilot-surface hover:bg-copilot-surface-hover text-copilot-text-muted hover:text-copilot-text transition-colors text-[9px]"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="p-1 rounded bg-copilot-surface hover:bg-copilot-surface-hover text-copilot-text-muted hover:text-copilot-text transition-colors"
          title={copied ? 'Copied!' : 'Copy JSON'}
          aria-label={copied ? 'Copied!' : 'Copy JSON'}
        >
          {copied ? (
            <CheckIcon size={12} className="text-copilot-success" />
          ) : (
            <CopyIcon size={12} />
          )}
        </button>
      </div>
    </div>
  );
};
