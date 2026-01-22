'use client';

import Link from 'next/link';

interface ValidationHeaderProps {
  isRunning: boolean;
  passedCount: number;
  failedCount: number;
  totalCount: number;
  onRun: () => void;
  onReset: () => void;
}

export function ValidationHeader({
  isRunning,
  passedCount,
  failedCount,
  totalCount,
  onRun,
  onReset,
}: ValidationHeaderProps) {
  const hasResults = passedCount > 0 || failedCount > 0;
  const allPassed = hasResults && failedCount === 0 && passedCount === totalCount;
  const allFailed = hasResults && passedCount === 0 && failedCount === totalCount;

  return (
    <header
      className="px-4 py-4 shrink-0 animate-fade-in border-b"
      style={{ background: 'var(--background)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-smooth"
            style={{
              background: allPassed
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : allFailed
                  ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                  : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
              boxShadow: allPassed
                ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                : allFailed
                  ? '0 2px 8px rgba(239, 68, 68, 0.3)'
                  : '0 2px 8px rgba(217, 119, 87, 0.3)',
            }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              E2E Test Runner
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Validate agent behavior with {totalCount} tests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Results counter */}
          {hasResults && (
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: '#D1FAE5' }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: '#065F46' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-medium" style={{ color: '#065F46' }}>
                  {passedCount}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ background: '#FEE2E2' }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: '#DC2626' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-sm font-medium" style={{ color: '#DC2626' }}>
                  {failedCount}
                </span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-sm px-3 py-1.5 rounded-lg transition-smooth btn-lift flex items-center gap-1.5"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--user-message-bg)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Chat
            </Link>
            {hasResults && !isRunning && (
              <button
                onClick={onReset}
                className="text-sm px-3 py-1.5 rounded-lg transition-smooth btn-lift flex items-center gap-1.5"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'var(--user-message-bg)',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reset
              </button>
            )}
            <button
              onClick={onRun}
              disabled={isRunning}
              className="text-sm px-4 py-1.5 rounded-lg transition-smooth btn-lift flex items-center gap-1.5 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isRunning
                  ? 'var(--text-muted)'
                  : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                boxShadow: isRunning ? 'none' : '0 2px 8px rgba(217, 119, 87, 0.3)',
              }}
            >
              {isRunning ? (
                <>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white typing-dot" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white typing-dot" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white typing-dot" />
                  </div>
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Run Tests
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
