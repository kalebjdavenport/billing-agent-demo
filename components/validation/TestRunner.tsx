'use client';

import { useValidationStream, getSuiteOptions } from '@/hooks/useValidationStream';
import { ValidationHeader } from './ValidationHeader';
import { TestCard } from './TestCard';

export function TestRunner() {
  const { state, selectedSuite, setSelectedSuite, runValidation, reset } = useValidationStream();
  const suiteOptions = getSuiteOptions();

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      <ValidationHeader
        isRunning={state.isRunning}
        passedCount={state.passedCount}
        failedCount={state.failedCount}
        totalCount={state.tests.length}
        selectedSuite={selectedSuite}
        suiteOptions={suiteOptions}
        onSuiteChange={setSelectedSuite}
        onRun={runValidation}
        onReset={reset}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Test preview - show tests before running */}
          {!state.isRunning && state.passedCount === 0 && state.failedCount === 0 && (
            <div className="space-y-3 animate-fade-in">
              {state.tests.map((test, index) => (
                <div
                  key={test.name}
                  className="p-4 rounded-lg border"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-medium"
                      style={{
                        background: 'var(--user-message-bg)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm font-medium mb-1"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {test.name}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        &ldquo;{test.query}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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
