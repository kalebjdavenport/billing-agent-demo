'use client';

import { useValidationStream } from '@/hooks/useValidationStream';
import { ValidationHeader } from './ValidationHeader';
import { TestCard } from './TestCard';

export function TestRunner() {
  const { state, runValidation, reset } = useValidationStream();

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      <ValidationHeader
        isRunning={state.isRunning}
        passedCount={state.passedCount}
        failedCount={state.failedCount}
        totalCount={state.tests.length}
        onRun={runValidation}
        onReset={reset}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Empty state */}
          {!state.isRunning && state.passedCount === 0 && state.failedCount === 0 && (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 animate-scale-in"
                style={{
                  background: 'linear-gradient(135deg, var(--user-message-bg) 0%, var(--surface) 100%)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                }}
              >
                <svg
                  className="w-10 h-10"
                  style={{ color: 'var(--accent)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2
                className="text-xl font-semibold mb-2 animate-slide-up stagger-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Ready to validate
              </h2>
              <p
                className="text-sm mb-6 text-center max-w-md animate-slide-up stagger-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                Run the E2E test suite to verify agent behavior. Each test will show real-time progress
                including checklist steps, tool calls, and reasoning.
              </p>
              <div className="flex flex-wrap gap-2 justify-center animate-slide-up stagger-3">
                {state.tests.slice(0, 3).map((test) => (
                  <span
                    key={test.name}
                    className="text-xs px-3 py-1.5 rounded-full"
                    style={{
                      background: 'var(--user-message-bg)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {test.name}
                  </span>
                ))}
                <span
                  className="text-xs px-3 py-1.5 rounded-full"
                  style={{
                    background: 'var(--user-message-bg)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  +{state.tests.length - 3} more
                </span>
              </div>
            </div>
          )}

          {/* Test list */}
          {(state.isRunning || state.passedCount > 0 || state.failedCount > 0) && (
            <div className="space-y-4">
              {state.tests.map((test, index) => (
                <TestCard key={test.name} test={test} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="px-4 py-3 text-center text-xs shrink-0 border-t"
        style={{
          color: 'var(--text-muted)',
          background: 'var(--background)',
          borderColor: 'var(--border)',
        }}
      >
        Cloud Billing Agent Validation Suite
      </footer>
    </div>
  );
}
