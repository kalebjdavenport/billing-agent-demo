'use client';

import Link from 'next/link';
import { useAgentStream } from '@/hooks/useAgentStream';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

export function Chat() {
  const { messages, isStreaming, error, sendMessage, clearMessages } = useAgentStream();

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--background)' }}>
      {/* Minimal Header */}
      <header
        className="px-4 py-3 shrink-0 animate-fade-in"
        style={{ background: 'var(--background)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Animated logo */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm transition-smooth"
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                boxShadow: '0 2px 8px rgba(217, 119, 87, 0.3)',
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                Billing Agent
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="text-sm px-3 py-1.5 rounded-lg transition-smooth btn-lift flex items-center gap-1.5"
                style={{
                  color: 'var(--text-secondary)',
                  background: 'var(--user-message-bg)',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
            )}
            <Link
              href="/validate"
              className="text-sm px-3 py-1.5 rounded-lg transition-smooth btn-lift flex items-center gap-1.5"
              style={{
                color: 'white',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
                boxShadow: '0 2px 6px rgba(217, 119, 87, 0.25)',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validate
            </Link>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div
          className="px-4 py-2.5 shrink-0 animate-slide-down"
          style={{ background: '#FEF2F2' }}
        >
          <div className="max-w-3xl mx-auto flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0"
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
            <p className="text-sm" style={{ color: '#DC2626' }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} isStreaming={isStreaming} onSendMessage={sendMessage} />

      {/* Input */}
      <ChatInput
        onSubmit={sendMessage}
        disabled={isStreaming}
        placeholder="Ask about your billing data..."
      />
    </div>
  );
}
