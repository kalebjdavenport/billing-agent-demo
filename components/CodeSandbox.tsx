'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BillingTransaction } from '@/my-agent/cloud-billing-agent/src/data/transactions';
import { executeCode } from '@/lib/code-executor';

// Simple code editor component (fallback if Monaco isn't available)
function SimpleCodeEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-full font-mono text-sm p-4 resize-none focus:outline-none"
      style={{
        background: 'var(--code-bg, #1e1e1e)',
        color: 'var(--code-text, #d4d4d4)',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
      }}
      spellCheck={false}
    />
  );
}

// Monaco Editor wrapper (will be used if @monaco-editor/react is installed)
function MonacoEditorWrapper({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  // Try to use Monaco if available, otherwise fallback to simple editor
  try {
    // Dynamic import - will only work if package is installed
    const MonacoEditor = require('@monaco-editor/react').default;
    return (
      <MonacoEditor
        height="100%"
        language="javascript"
        theme="vs-dark"
        value={value}
        onChange={(val: string | undefined) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    );
  } catch {
    return (
      <SimpleCodeEditor
        value={value}
        onChange={onChange}
        placeholder="// Enter your JavaScript code here...\n// Example:\n// const total = transactions\n//   .filter(tx => tx.service.includes('EC2'))\n//   .reduce((sum, tx) => sum + tx.amount, 0);\n// console.log('Total EC2 spend:', total);"
      />
    );
  }
}

export function CodeSandbox() {
  // Check for code from sessionStorage (loaded from agent response)
  const getInitialCode = () => {
    if (typeof window !== 'undefined') {
      const savedCode = sessionStorage.getItem('sandboxCode');
      if (savedCode) {
        sessionStorage.removeItem('sandboxCode');
        return savedCode;
      }
    }
    return `// Calculate total EC2 spending
const ec2Total = transactions
  .filter(tx => tx.service.includes('EC2'))
  .reduce((sum, tx) => sum + tx.amount, 0);

console.log('Total EC2 spend: $' + ec2Total.toFixed(2));`;
  };

  const [code, setCode] = useState(getInitialCode);
  
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [result, setResult] = useState<{ success: boolean; result?: unknown; error?: string; executionTime: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load transactions data
  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data);
        setIsLoadingData(false);
      })
      .catch((err) => {
        console.error('Failed to load transactions:', err);
        setIsLoadingData(false);
      });
  }, []);

  const handleRun = () => {
    if (!code.trim()) {
      setResult({
        success: false,
        error: 'Please enter some code to execute',
        executionTime: 0,
      });
      return;
    }

    setIsLoading(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      const execResult = executeCode(code, transactions);
      setResult(execResult);
      setIsLoading(false);
    }, 50);
  };


  const handleClear = () => {
    setCode('');
    setResult(null);
  };

  const handleReset = () => {
    setCode(`// Calculate total EC2 spending
const ec2Total = transactions
  .filter(tx => tx.service.includes('EC2'))
  .reduce((sum, tx) => sum + tx.amount, 0);

console.log('Total EC2 spend: $' + ec2Total.toFixed(2));`);
    setResult(null);
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <header className="px-4 py-3 shrink-0 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Code Sandbox
              </h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Run JavaScript queries on your billing data
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoadingData ? (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loading data...</span>
            ) : (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {transactions.length} transactions loaded
              </span>
            )}
            <Link
              href="/"
              className="text-sm px-3 py-1.5 rounded-lg transition-smooth"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--user-message-bg)',
              }}
            >
              Chat
            </Link>
            <button
              onClick={handleReset}
              className="text-sm px-3 py-1.5 rounded-lg transition-smooth"
              style={{
                color: 'var(--text-secondary)',
                background: 'var(--user-message-bg)',
              }}
            >
              Reset
            </button>
            <button
              onClick={handleRun}
              disabled={isLoading || isLoadingData}
              className="text-sm px-4 py-1.5 rounded-lg transition-smooth font-medium disabled:opacity-50"
              style={{
                color: 'white',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
              }}
            >
              {isLoading ? 'Running...' : '▶ Run'}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Code editor */}
        <div className="flex-1 flex flex-col border-r" style={{ borderColor: 'var(--border)' }}>
          <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              JavaScript Code
            </span>
            <button
              onClick={handleClear}
              className="text-xs px-2 py-1 rounded transition-smooth"
              style={{ color: 'var(--text-secondary)', background: 'var(--user-message-bg)' }}
            >
              Clear
            </button>
          </div>
          <div ref={editorRef} className="flex-1 min-h-0" style={{ position: 'relative' }}>
            <MonacoEditorWrapper value={code} onChange={setCode} />
          </div>
        </div>

        {/* Results panel */}
        <div className="w-96 flex flex-col border-l" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
          <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Output
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {result ? (
              <div className="space-y-3">
                {result.success ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4" style={{ color: '#10b981' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium" style={{ color: '#10b981' }}>
                        Execution successful ({result.executionTime.toFixed(2)}ms)
                      </span>
                    </div>
                    <pre
                      className="text-xs p-3 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap"
                      style={{ background: 'var(--code-bg)', color: 'var(--text-primary)' }}
                    >
                      {typeof result.result === 'object' ? JSON.stringify(result.result, null, 2) : String(result.result)}
                    </pre>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-medium" style={{ color: '#ef4444' }}>
                        Execution failed ({result.executionTime.toFixed(2)}ms)
                      </span>
                    </div>
                    <pre
                      className="text-xs p-3 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap"
                      style={{ background: '#fee2e2', color: '#991b1b' }}
                    >
                      {result.error}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Click "Run" to execute your code
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  The code has access to a <code className="px-1 py-0.5 rounded" style={{ background: 'var(--code-bg)' }}>transactions</code> array
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with info */}
      <div className="px-4 py-2 border-t text-xs shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          <strong>Available:</strong> <code className="px-1 py-0.5 rounded" style={{ background: 'var(--code-bg)' }}>transactions</code> array
          {' • '}
          <code className="px-1 py-0.5 rounded" style={{ background: 'var(--code-bg)' }}>console.log()</code>, <code className="px-1 py-0.5 rounded" style={{ background: 'var(--code-bg)' }}>console.error()</code>
        </div>
      </div>
    </div>
  );
}
