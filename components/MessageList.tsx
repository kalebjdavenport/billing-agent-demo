'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@/lib/agent/types';

interface MessageListProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
}

export function MessageList({ messages, isStreaming = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center px-4 animate-fade-in">
          {/* Animated icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-scale-in"
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2
            className="text-xl font-semibold mb-2 animate-slide-up stagger-1"
            style={{ color: 'var(--text-primary)' }}
          >
            What would you like to know?
          </h2>
          <p
            className="text-sm mb-6 animate-slide-up stagger-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            Ask about transactions, costs, or billing summaries
          </p>
          {/* Example prompts */}
          <div className="flex flex-wrap gap-2 justify-center animate-slide-up stagger-3">
            {['Total spend last month?', 'Show EC2 costs', 'Any pending charges?'].map((prompt) => (
              <span
                key={prompt}
                className="text-xs px-3 py-1.5 rounded-full transition-smooth"
                style={{
                  background: 'var(--user-message-bg)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {prompt}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((message, index) => (
          <MessageRow
            key={message.id}
            message={message}
            isStreaming={isStreaming}
            isLatest={index === messages.length - 1}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

interface MessageRowProps {
  message: ChatMessage;
  isStreaming?: boolean;
  isLatest?: boolean;
}

function MessageRow({ message, isStreaming, isLatest }: MessageRowProps) {
  const isUser = message.role === 'user';
  const isCurrentlyStreaming = isStreaming && message.role === 'assistant' && !message.content;

  return (
    <div className={`flex gap-3 ${isLatest ? 'animate-slide-up' : ''}`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-medium transition-smooth"
        style={{
          background: isUser
            ? 'var(--user-message-bg)'
            : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
          color: isUser ? 'var(--text-secondary)' : 'white',
          boxShadow: isUser ? 'none' : '0 2px 6px rgba(217, 119, 87, 0.25)',
        }}
      >
        {isUser ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        {/* Message content */}
        {message.content ? (
          isUser ? (
            <div
              className="inline-block rounded-2xl rounded-tl-lg px-4 py-2.5 max-w-full"
              style={{
                background: 'var(--user-message-bg)',
                color: 'var(--text-primary)',
              }}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          ) : (
            <div className="prose-chat" style={{ color: 'var(--text-primary)' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )
        ) : isCurrentlyStreaming ? (
          <div className="flex items-center gap-3 py-2">
            <TypingIndicator />
          </div>
        ) : null}

        {/* Tool calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.toolCalls.map((tool, idx) => (
              <div
                key={idx}
                className="rounded-xl border overflow-hidden card-hover animate-scale-in"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                }}
              >
                {/* Tool header */}
                <div
                  className="flex items-center justify-between px-3 py-2"
                  style={{
                    background: 'var(--code-bg)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: 'var(--surface)' }}
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                      className="font-mono text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {tool.name.replace(/_/g, ' ')}
                    </span>
                  </div>
                  {tool.result ? (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: '#D1FAE5', color: '#065F46' }}
                    >
                      ✓ done
                    </span>
                  ) : (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1.5 status-running"
                      style={{ background: '#FEF3C7', color: '#92400E' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      running
                    </span>
                  )}
                </div>

                {/* Tool content */}
                <div className="p-3 space-y-3">
                  {tool.input && Object.keys(tool.input).length > 0 && (
                    <details className="group">
                      <summary
                        className="cursor-pointer text-xs font-medium flex items-center gap-1.5 select-none"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <svg
                          className="w-3 h-3 transition-transform duration-200 group-open:rotate-90"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Parameters
                      </summary>
                      <pre
                        className="mt-2 text-xs p-3 rounded-lg overflow-x-auto font-mono"
                        style={{ background: 'var(--code-bg)', color: 'var(--text-secondary)' }}
                      >
                        {JSON.stringify(tool.input, null, 2)}
                      </pre>
                    </details>
                  )}

                  {tool.result && (
                    <div className="prose-chat prose-sm" style={{ color: 'var(--text-primary)' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{tool.result}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full typing-dot"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="w-2 h-2 rounded-full typing-dot"
        style={{ background: 'var(--accent)' }}
      />
      <div
        className="w-2 h-2 rounded-full typing-dot"
        style={{ background: 'var(--accent)' }}
      />
    </div>
  );
}
