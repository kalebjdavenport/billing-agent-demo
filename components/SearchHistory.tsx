'use client';

import { SearchHistoryItem } from '@/hooks/useSearchHistory';

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (query: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function SearchHistory({ history, onSelect, onRemove, onClear }: SearchHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            History
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Your search history will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="p-3 border-b flex items-center justify-between shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          History
        </h2>
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 rounded transition-smooth hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          Clear
        </button>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {history.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg transition-smooth cursor-pointer"
              style={{ background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--user-message-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <button
                onClick={() => onSelect(item.query)}
                className="w-full text-left p-2 pr-8"
              >
                <p
                  className="text-sm truncate"
                  style={{ color: 'var(--text-primary)' }}
                  title={item.query}
                >
                  {item.query}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatTimestamp(item.timestamp)}
                </p>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than a minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }

  // Less than an hour
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000));
    return `${mins}m ago`;
  }

  // Less than a day
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }

  // Less than a week
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  }

  // Format as date
  return new Date(timestamp).toLocaleDateString();
}
