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
  const [isFocused, setIsFocused] = useState(false);
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
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSubmit = input.trim() && !disabled;

  return (
    <div
      className="shrink-0 py-4 animate-fade-in"
      style={{ background: 'var(--background)' }}
    >
      {/* Centered container */}
      <div className="max-w-3xl mx-auto px-4">
        <form onSubmit={handleSubmit}>
          <div
            className={`
              relative flex items-center gap-2 rounded-2xl border px-4 py-3
              transition-all duration-200 input-glow
            `}
            style={{
              background: 'var(--surface)',
              borderColor: isFocused ? 'var(--accent)' : 'var(--border-strong)',
              boxShadow: isFocused
                ? '0 0 0 3px rgba(217, 119, 87, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)'
                : '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="flex-1 resize-none bg-transparent focus:outline-none disabled:cursor-not-allowed text-base leading-relaxed"
              style={{
                color: 'var(--text-primary)',
                minHeight: '28px',
                maxHeight: '200px',
              }}
            />

            {/* Submit button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`
                shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                transition-all duration-200 btn-lift
                ${canSubmit ? 'opacity-100' : 'opacity-50'}
              `}
              style={{
                background: canSubmit
                  ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)'
                  : 'var(--border)',
                boxShadow: canSubmit ? '0 2px 8px rgba(217, 119, 87, 0.3)' : 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {disabled ? (
                // Loading spinner
                <svg
                  className="w-5 h-5 animate-spin"
                  style={{ color: 'white' }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                // Send arrow
                <svg
                  className="w-5 h-5"
                  style={{ color: canSubmit ? 'white' : 'var(--text-muted)' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>

        {/* Helper text */}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: 'var(--user-message-bg)',
                border: '1px solid var(--border)',
              }}
            >
              ↵
            </kbd>
            send
          </span>
          <span
            className="text-xs flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            <kbd
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                background: 'var(--user-message-bg)',
                border: '1px solid var(--border)',
              }}
            >
              ⇧↵
            </kbd>
            new line
          </span>
        </div>
      </div>
    </div>
  );
}
