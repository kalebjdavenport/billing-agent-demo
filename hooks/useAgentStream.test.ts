import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgentStream } from './useAgentStream';

// Helper to create a mock SSE stream
function createMockSSEStream(events: Array<{ type: string; [key: string]: unknown }>) {
  const encoder = new TextEncoder();
  const data = events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('');

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(data));
      controller.close();
    },
  });
}

// Helper to create a slow SSE stream that yields events one at a time
function createSlowSSEStream(events: Array<{ type: string; [key: string]: unknown }>) {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    async pull(controller) {
      if (index < events.length) {
        const data = `data: ${JSON.stringify(events[index])}\n\n`;
        controller.enqueue(encoder.encode(data));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

describe('useAgentStream', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with empty messages array', () => {
      const { result } = renderHook(() => useAgentStream());

      expect(result.current.messages).toEqual([]);
    });

    it('starts with isStreaming false', () => {
      const { result } = renderHook(() => useAgentStream());

      expect(result.current.isStreaming).toBe(false);
    });

    it('starts with null error', () => {
      const { result } = renderHook(() => useAgentStream());

      expect(result.current.error).toBeNull();
    });
  });

  describe('sendMessage', () => {
    it('ignores empty messages', async () => {
      global.fetch = vi.fn();
      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('');
      });

      expect(global.fetch).not.toHaveBeenCalled();
      expect(result.current.messages).toEqual([]);
    });

    it('ignores whitespace-only messages', async () => {
      global.fetch = vi.fn();
      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('   ');
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('adds user message immediately', async () => {
      const stream = createMockSSEStream([{ type: 'done' }]);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(result.current.messages[0]).toMatchObject({
        role: 'user',
        content: 'Hello',
      });
    });

    it('adds assistant placeholder message', async () => {
      const stream = createMockSSEStream([{ type: 'done' }]);
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hello');
      });

      expect(result.current.messages[1]).toMatchObject({
        role: 'assistant',
        content: '',
      });
    });

    it('sets isStreaming to true during request', async () => {
      let resolveStream: () => void;
      const streamPromise = new Promise<void>((resolve) => {
        resolveStream = resolve;
      });

      global.fetch = vi.fn().mockImplementation(async () => {
        await streamPromise;
        return {
          ok: true,
          body: createMockSSEStream([{ type: 'done' }]),
        };
      });

      const { result } = renderHook(() => useAgentStream());

      act(() => {
        result.current.sendMessage('Hello');
      });

      // Should be streaming while waiting
      expect(result.current.isStreaming).toBe(true);

      // Resolve and complete
      await act(async () => {
        resolveStream!();
        await vi.runAllTimersAsync();
      });
    });
  });

  describe('SSE parsing', () => {
    it('parses text messages and appends to content', async () => {
      const stream = createMockSSEStream([
        { type: 'text', content: 'Hello' },
        { type: 'text', content: ' world' },
        { type: 'done' },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      expect(result.current.messages[1].content).toBe('Hello world');
    });

    it('parses tool_use messages and adds to toolCalls', async () => {
      const stream = createMockSSEStream([
        { type: 'tool_use', toolName: 'get_transactions', input: { limit: 10 } },
        { type: 'done' },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Show transactions');
      });

      expect(result.current.messages[1].toolCalls).toEqual([
        { name: 'get_transactions', input: { limit: 10 } },
      ]);
    });

    it('parses tool_result and updates matching tool call', async () => {
      const stream = createMockSSEStream([
        { type: 'tool_use', toolName: 'get_transactions', input: {} },
        { type: 'tool_result', toolName: 'get_transactions', result: 'Found 5 transactions' },
        { type: 'done' },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Show transactions');
      });

      expect(result.current.messages[1].toolCalls?.[0].result).toBe('Found 5 transactions');
    });

    it('handles done message gracefully', async () => {
      const stream = createMockSSEStream([
        { type: 'text', content: 'Complete' },
        { type: 'done' },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.messages[1].content).toBe('Complete');
    });
  });

  describe('error handling', () => {
    it('sets error state on HTTP error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' }),
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      expect(result.current.error).toBe('Server error');
    });

    it('handles HTTP error without JSON body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      expect(result.current.error).toBe('HTTP error: 500');
    });

    it('sets error state on network failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      expect(result.current.error).toBe('Network error');
    });

    // Note: Stream error events are caught in the inner try/catch and logged,
    // but not propagated to the error state. This is a known limitation.
    it('logs error event from stream (does not set error state)', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const stream = createMockSSEStream([
        { type: 'error', error: 'Stream error' },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      // Error is logged but not set to state due to inner try/catch
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('handles missing response body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: null,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      expect(result.current.error).toBe('No response body');
    });
  });

  describe('clearMessages', () => {
    it('clears all messages', async () => {
      const stream = createMockSSEStream([
        { type: 'text', content: 'Response' },
        { type: 'done' },
      ]);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        body: stream,
      });

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      expect(result.current.messages.length).toBe(2);

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.messages).toEqual([]);
    });

    it('clears error on clearMessages', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useAgentStream());

      await act(async () => {
        await result.current.sendMessage('Hi');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearMessages();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
