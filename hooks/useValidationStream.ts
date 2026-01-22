'use client';

import { useState, useCallback, useRef } from 'react';
import { ValidationMessage, TestState, ValidationState, TestStep } from '@/lib/agent/types';
import { TEST_CASES, STEP_NAMES } from '@/lib/agent/validation-constants';

/**
 * Create initial test state from test cases
 */
function createInitialTestState(): TestState[] {
  return TEST_CASES.map((tc) => ({
    name: tc.name,
    query: tc.query,
    status: 'pending',
    steps: STEP_NAMES.map((name) => ({ name, status: 'pending' })),
    thinking: '',
    response: '',
    toolCalls: [],
  }));
}

/**
 * Create initial validation state
 */
function createInitialState(): ValidationState {
  return {
    tests: createInitialTestState(),
    currentTestIndex: -1,
    isRunning: false,
    passedCount: 0,
    failedCount: 0,
  };
}

interface UseValidationStreamReturn {
  state: ValidationState;
  runValidation: () => Promise<void>;
  reset: () => void;
}

/**
 * React hook for running validation tests with real-time streaming updates.
 */
export function useValidationStream(): UseValidationStreamReturn {
  const [state, setState] = useState<ValidationState>(createInitialState);
  const abortControllerRef = useRef<AbortController | null>(null);

  const runValidation = useCallback(async () => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset state and start running
    setState({
      tests: createInitialTestState(),
      currentTestIndex: -1,
      isRunning: true,
      passedCount: 0,
      failedCount: 0,
    });

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
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
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr.trim()) {
              try {
                const message = JSON.parse(jsonStr) as ValidationMessage;
                setState((prev) => processMessage(prev, message));
              } catch (parseError) {
                console.error('Failed to parse SSE message:', parseError, jsonStr);
              }
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Validation error:', err);
    } finally {
      setState((prev) => ({ ...prev, isRunning: false }));
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(createInitialState());
  }, []);

  return { state, runValidation, reset };
}

/**
 * Process a validation message and return updated state
 */
function processMessage(state: ValidationState, message: ValidationMessage): ValidationState {
  switch (message.type) {
    case 'test_start': {
      const tests = [...state.tests];
      tests[message.testIndex] = {
        ...tests[message.testIndex],
        status: 'running',
      };
      return { ...state, tests, currentTestIndex: message.testIndex };
    }

    case 'step': {
      const tests = [...state.tests];
      const test = tests[message.testIndex];
      if (test) {
        const steps: TestStep[] = [...test.steps];
        steps[message.stepIndex] = {
          ...steps[message.stepIndex],
          status: message.status,
        };
        tests[message.testIndex] = { ...test, steps };
      }
      return { ...state, tests };
    }

    case 'thinking': {
      if (state.currentTestIndex < 0) return state;
      const tests = [...state.tests];
      const test = tests[state.currentTestIndex];
      if (test) {
        tests[state.currentTestIndex] = {
          ...test,
          thinking: test.thinking + message.content,
        };
      }
      return { ...state, tests };
    }

    case 'text': {
      if (state.currentTestIndex < 0) return state;
      const tests = [...state.tests];
      const test = tests[state.currentTestIndex];
      if (test) {
        tests[state.currentTestIndex] = {
          ...test,
          response: test.response + message.content,
        };
      }
      return { ...state, tests };
    }

    case 'tool_use': {
      if (state.currentTestIndex < 0) return state;
      const tests = [...state.tests];
      const test = tests[state.currentTestIndex];
      if (test) {
        tests[state.currentTestIndex] = {
          ...test,
          toolCalls: [
            ...test.toolCalls,
            { name: message.toolName, input: message.input },
          ],
        };
      }
      return { ...state, tests };
    }

    case 'progress': {
      if (state.currentTestIndex < 0) return state;
      const tests = [...state.tests];
      const test = tests[state.currentTestIndex];
      if (test) {
        const toolCalls = [...test.toolCalls];
        // Find the last tool call with this name that doesn't have elapsedMs
        const idx = toolCalls.findIndex(
          (tc) => tc.name === message.toolName && tc.elapsedMs === undefined
        );
        if (idx !== -1) {
          toolCalls[idx] = { ...toolCalls[idx], elapsedMs: message.elapsedMs };
        }
        tests[state.currentTestIndex] = { ...test, toolCalls };
      }
      return { ...state, tests };
    }

    case 'tool_result': {
      if (state.currentTestIndex < 0) return state;
      const tests = [...state.tests];
      const test = tests[state.currentTestIndex];
      if (test) {
        const toolCalls = [...test.toolCalls];
        // Find the last tool call with this name that doesn't have a result
        const idx = toolCalls.findIndex(
          (tc) => tc.name === message.toolName && !tc.result
        );
        if (idx !== -1) {
          toolCalls[idx] = { ...toolCalls[idx], result: message.result };
        }
        tests[state.currentTestIndex] = { ...test, toolCalls };
      }
      return { ...state, tests };
    }

    case 'test_result': {
      const tests = [...state.tests];
      tests[message.testIndex] = {
        ...tests[message.testIndex],
        status: message.passed ? 'passed' : 'failed',
        response: message.response,
        failureReason: message.reason,
      };
      return {
        ...state,
        tests,
        passedCount: state.passedCount + (message.passed ? 1 : 0),
        failedCount: state.failedCount + (message.passed ? 0 : 1),
      };
    }

    case 'error': {
      if (message.testIndex !== undefined) {
        const tests = [...state.tests];
        tests[message.testIndex] = {
          ...tests[message.testIndex],
          status: 'failed',
          failureReason: message.error,
        };
        return { ...state, tests, failedCount: state.failedCount + 1 };
      }
      return state;
    }

    case 'done': {
      return { ...state, isRunning: false };
    }

    default:
      return state;
  }
}
