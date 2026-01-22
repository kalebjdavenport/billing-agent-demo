'use client';

import { useState, FormEvent, KeyboardEvent, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSubmit,
  disabled = false,
  placeholder = 'Type your message...',
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="shrink-0 border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="max-w-3xl mx-auto p-4">
        <form onSubmit={handleSubmit}>
          <div
            className="flex items-end gap-3 rounded-2xl border px-4 py-3 transition-all focus-within:border-opacity-100"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border-strong)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="flex-1 resize-none bg-transparent focus:outline-none disabled:cursor-not-allowed"
              style={{
                color: 'var(--text-primary)',
                minHeight: '24px',
                maxHeight: '200px',
              }}
            />
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: disabled || !input.trim() ? 'var(--border)' : 'var(--accent)',
              }}
              onMouseEnter={(e) => {
                if (!disabled && input.trim()) {
                  e.currentTarget.style.background = 'var(--accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled && input.trim()) {
                  e.currentTarget.style.background = 'var(--accent)';
                }
              }}
            >
              {disabled ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  style={{ color: 'var(--text-muted)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  style={{ color: input.trim() ? 'white' : 'var(--text-muted)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
        <p
          className="mt-2 text-center text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
