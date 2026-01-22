'use client';

import { TestState } from '@/lib/agent/types';
import { ChecklistProgress } from './ChecklistProgress';
import { ThinkingBlock } from './ThinkingBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface TestCardProps {
  test: TestState;
  index: number;
}

function StatusBadge({ status }: { status: TestState['status'] }) {
  const config = {
    pending: { bg: 'var(--user-message-bg)', color: 'var(--text-muted)', label: 'Pending' },
    running: { bg: '#FEF3C7', color: '#92400E', label: 'Running' },
    passed: { bg: '#D1FAE5', color: '#065F46', label: 'Passed' },
    failed: { bg: '#FEE2E2', color: '#DC2626', label: 'Failed' },
  };
  const { bg, color, label } = config[status];

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        status === 'running' ? 'status-running' : ''
      }`}
      style={{ background: bg, color }}
    >
      {status === 'running' && (
        <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: color }} />
      )}
      {label}
    </span>
  );
}

export function TestCard({ test, index }: TestCardProps) {
  const isActive = test.status === 'running';
  const hasToolCalls = test.toolCalls.length > 0;

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${
        isActive ? 'ring-2 ring-offset-2' : ''
      } ${test.status !== 'pending' ? 'animate-scale-in' : ''}`}
      style={{
        borderColor: isActive ? 'var(--accent)' : 'var(--border)',
        background: 'var(--surface)',
        ringColor: isActive ? 'var(--accent)' : 'transparent',
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background:
            test.status === 'passed'
              ? '#F0FDF4'
              : test.status === 'failed'
                ? '#FEF2F2'
                : test.status === 'running'
                  ? '#FFFBEB'
                  : 'var(--code-bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-semibold"
            style={{
              background:
                test.status === 'passed'
                  ? '#D1FAE5'
                  : test.status === 'failed'
                    ? '#FEE2E2'
                    : test.status === 'running'
                      ? '#FEF3C7'
                      : 'var(--user-message-bg)',
              color:
                test.status === 'passed'
                  ? '#065F46'
                  : test.status === 'failed'
                    ? '#DC2626'
                    : test.status === 'running'
                      ? '#92400E'
                      : 'var(--text-secondary)',
            }}
          >
            {index + 1}
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {test.name}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              &ldquo;{test.query}&rdquo;
            </p>
          </div>
        </div>
        <StatusBadge status={test.status} />
      </div>

      {/* Content */}
      {test.status !== 'pending' && (
        <div className="p-4 space-y-4">
          {/* Checklist progress */}
          <div className="flex gap-6">
            <div className="shrink-0">
              <ChecklistProgress steps={test.steps} />
            </div>

            {/* Tool calls */}
            {hasToolCalls && (
              <div className="flex-1 min-w-0 space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                  Tool Calls
                </p>
                {test.toolCalls.map((tool, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border p-2.5 animate-scale-in"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--code-bg)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center"
                          style={{ background: 'var(--surface)' }}
                        >
                          <svg
                            className="w-3 h-3"
                            style={{ color: 'var(--accent)' }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <span
                          className="text-xs font-mono font-medium"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {tool.name.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tool.elapsedMs !== undefined && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {tool.elapsedMs}ms
                          </span>
                        )}
                        {tool.result ? (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{ background: '#D1FAE5', color: '#065F46' }}
                          >
                            done
                          </span>
                        ) : (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded font-medium status-running"
                            style={{ background: '#FEF3C7', color: '#92400E' }}
                          >
                            running
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thinking block */}
          {test.thinking && (
            <ThinkingBlock content={test.thinking} isStreaming={test.status === 'running'} />
          )}

          {/* Response */}
          {test.response && (
            <div
              className="rounded-lg border p-3"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--background)',
              }}
            >
              <p
                className="text-xs font-medium mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Response
              </p>
              <div className="prose-chat prose-sm" style={{ color: 'var(--text-primary)' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{test.response}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Failure reason */}
          {test.failureReason && (
            <div
              className="rounded-lg p-3 animate-scale-in"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}
            >
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: '#DC2626' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#DC2626' }}>
                    Failure Reason
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#991B1B' }}>
                    {test.failureReason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
