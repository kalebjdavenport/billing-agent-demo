'use client';

import { TestStep, StepStatus } from '@/lib/agent/types';

interface ChecklistProgressProps {
  steps: TestStep[];
}

function StepIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'completed':
      return (
        <svg className="w-4 h-4" style={{ color: '#10B981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'running':
      return (
        <div className="w-4 h-4 flex items-center justify-center">
          <div
            className="w-2.5 h-2.5 rounded-full animate-pulse-subtle"
            style={{ background: 'var(--accent)' }}
          />
        </div>
      );
    case 'failed':
      return (
        <svg className="w-4 h-4" style={{ color: '#EF4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    default:
      return (
        <div className="w-4 h-4 flex items-center justify-center">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: 'var(--border-strong)' }}
          />
        </div>
      );
  }
}

export function ChecklistProgress({ steps }: ChecklistProgressProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200 ${
              step.status === 'running' ? 'scale-110' : ''
            }`}
            style={{
              background:
                step.status === 'completed'
                  ? '#D1FAE5'
                  : step.status === 'failed'
                    ? '#FEE2E2'
                    : step.status === 'running'
                      ? '#FEF3C7'
                      : 'var(--user-message-bg)',
            }}
          >
            <StepIcon status={step.status} />
          </div>
          <span
            className={`text-xs font-medium transition-colors duration-200 ${
              step.status === 'running' ? 'status-running' : ''
            }`}
            style={{
              color:
                step.status === 'completed'
                  ? '#065F46'
                  : step.status === 'failed'
                    ? '#DC2626'
                    : step.status === 'running'
                      ? '#92400E'
                      : 'var(--text-muted)',
            }}
          >
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
}
