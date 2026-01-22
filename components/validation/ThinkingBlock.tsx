'use client';

import { useState } from 'react';

interface ThinkingBlockProps {
  content: string;
  isStreaming?: boolean;
}

export function ThinkingBlock({ content, isStreaming = false }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!content) return null;

  const preview = content.slice(0, 150);
  const hasMore = content.length > 150;

  return (
    <div
      className="rounded-lg border overflow-hidden animate-scale-in"
      style={{
        borderColor: 'var(--border)',
        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left transition-smooth"
        style={{ borderBottom: isExpanded ? '1px solid var(--border)' : 'none' }}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center ${
              isStreaming ? 'animate-pulse-subtle' : ''
            }`}
            style={{ background: '#DBEAFE' }}
          >
            <svg
              className="w-3.5 h-3.5"
              style={{ color: '#2563EB' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <span className="text-xs font-medium" style={{ color: '#1E40AF' }}>
            Agent Thinking
          </span>
          {isStreaming && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#DBEAFE', color: '#2563EB' }}>
              streaming...
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          style={{ color: '#2563EB' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!isExpanded && hasMore && (
        <div className="px-3 py-2">
          <p
            className="text-xs italic"
            style={{ color: 'var(--text-secondary)' }}
          >
            {preview}...
          </p>
        </div>
      )}

      {isExpanded && (
        <div className="px-3 py-2 max-h-48 overflow-y-auto">
          <p
            className="text-xs whitespace-pre-wrap font-mono"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}
          >
            {content}
          </p>
        </div>
      )}
    </div>
  );
}
