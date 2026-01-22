'use client';

import { useState, useCallback, useRef } from 'react';
import { ValidationMessage, TestState, ValidationState, TestStep, TestSuite } from '@/lib/agent/types';
import { TEST_SUITES, STEP_NAMES, SUITE_DESCRIPTIONS } from '@/lib/agent/validation-constants';

// Valid suite options including 'all'
export type ValidSuite = TestSuite | 'all';

// Suite info for UI
export interface SuiteInfo {
  id: ValidSuite;
  label: string;
  description: string;
  count: number;
}

// Get all suite options with metadata
export function getSuiteOptions(): SuiteInfo[] {
  const allCount = Object.values(TEST_SUITES).reduce((sum, tests) => sum + tests.length, 0);

  return [
    { id: 'all', label: 'All Tests', description: 'Run all test suites', count: allCount },
    { id: 'core', label: 'Core', description: SUITE_DESCRIPTIONS.core, count: TEST_SUITES.core.length },
    { id: 'codegen', label: 'Codegen', description: SUITE_DESCRIPTIONS.codegen, count: TEST_SUITES.codegen.length },
    { id: 'security', label: 'Security', description: SUITE_DESCRIPTIONS.security, count: TEST_SUITES.security.length },
    { id: 'boundaries', label: 'Boundaries', description: SUITE_DESCRIPTIONS.boundaries, count: TEST_SUITES.boundaries.length },
  ];
}

/**
 * Get tests for a specific suite
 */
function getTestsForSuite(suite: ValidSuite) {
  if (suite === 'all') {
    return Object.values(TEST_SUITES).flat();
  }
  return TEST_SUITES[suite] || [];
}

/**
 * Create initial test state from test cases for a suite
 */
function createInitialTestState(suite: ValidSuite): TestState[] {
  const tests = getTestsForSuite(suite);
  return tests.map((tc) => ({
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
function createInitialState(suite: ValidSuite): ValidationState {
  return {
    tests: createInitialTestState(suite),
    currentTestIndex: -1,
    isRunning: false,
    passedCount: 0,
    failedCount: 0,
  };
}

interface UseValidationStreamReturn {
  state: ValidationState;
  selectedSuite: ValidSuite;
  setSelectedSuite: (suite: ValidSuite) => void;
  runValidation: () => Promise<void>;
  reset: () => void;
}

/**
 * React hook for running validation tests with real-time streaming updates.
 */
export function useValidationStream(): UseValidationStreamReturn {
  const [selectedSuite, setSelectedSuiteState] = useState<ValidSuite>('all');
  const [state, setState] = useState<ValidationState>(() => createInitialState('all'));
  const abortControllerRef = useRef<AbortController | null>(null);

  const setSelectedSuite = useCallback((suite: ValidSuite) => {
    // Don't allow changing suite while running
    if (state.isRunning) return;
    setSelectedSuiteState(suite);
    setState(createInitialState(suite));
  }, [state.isRunning]);

  const runValidation = useCallback(async () => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset state and start running
    setState({
      tests: createInitialTestState(selectedSuite),
      currentTestIndex: -1,
      isRunning: true,
      passedCount: 0,
      failedCount: 0,
    });

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suite: selectedSuite }),
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
      // Set error state so user knows something went wrong
      setState((prev) => ({
        ...prev,
        isRunning: false,
        tests: prev.tests.map((test, idx) =>
          idx === prev.currentTestIndex && prev.currentTestIndex >= 0
            ? { ...test, status: 'failed', failureReason: err instanceof Error ? err.message : 'Unknown error' }
            : test
        ),
      }));
    } finally {
      setState((prev) => ({ ...prev, isRunning: false }));
      abortControllerRef.current = null;
    }
  }, [selectedSuite]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState(createInitialState(selectedSuite));
  }, [selectedSuite]);

  return { state, selectedSuite, setSelectedSuite, runValidation, reset };
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
