'use client';

import { useState, useCallback, useRef } from 'react';
import { AgentMessage, ChatMessage } from '@/lib/agent/types';

interface UseAgentStreamReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (prompt: string) => Promise<void>;
  clearMessages: () => void;
}

/**
 * React hook for consuming SSE stream from the agent API.
 *
 * Manages chat message state and handles streaming responses.
 */
export function useAgentStream(): UseAgentStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setError(null);
    setIsStreaming(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    // Create assistant message placeholder
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      toolCalls: [],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6); // Remove 'data: ' prefix
            if (jsonStr.trim()) {
              try {
                const message = JSON.parse(jsonStr) as AgentMessage | { type: 'error'; error: string };

                if (message.type === 'error') {
                  throw new Error((message as { type: 'error'; error: string }).error);
                }

                // Update assistant message based on message type
                setMessages((prev) =>
                  prev.map((msg) => {
                    if (msg.id !== assistantMessageId) return msg;

                    switch (message.type) {
                      case 'text':
                        return { ...msg, content: msg.content + message.content };

                      case 'tool_use':
                        return {
                          ...msg,
                          toolCalls: [
                            ...(msg.toolCalls || []),
                            { name: message.toolName, input: message.input },
                          ],
                        };

                      case 'tool_result':
                        // Update the last tool call with its result
                        const toolCalls = [...(msg.toolCalls || [])];
                        const lastToolIdx = toolCalls.findIndex(
                          (tc) => tc.name === message.toolName && !tc.result
                        );
                        if (lastToolIdx !== -1) {
                          toolCalls[lastToolIdx] = {
                            ...toolCalls[lastToolIdx],
                            result: message.result,
                          };
                        }
                        return { ...msg, toolCalls };

                      case 'done':
                        return msg;

                      default:
                        return msg;
                    }
                  })
                );
              } catch (parseError) {
                console.error('Failed to parse SSE message:', parseError, jsonStr);
              }
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, ignore
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);

      // Update assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: msg.content || `Error: ${errorMessage}` }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearMessages,
  };
}
