// lib/agent/validation.ts
// Validation test runner with real-time streaming (server-only)

import { query } from '@anthropic-ai/claude-agent-sdk';
import { billingServer } from '../../my-agent/cloud-billing-agent/src/tools/server';
import { TestCase, TestSuite, ValidationMessage } from './types';
import { TEST_CASES, TEST_SUITES } from './validation-constants';
import { SYSTEM_PROMPT, MODEL } from './constants';
import { validateGeneratedCode, hasCodeAnalysis } from './code-validator';

// Code execution testing temporarily disabled - causes 500 errors in server context
// TODO: Re-enable when code execution can be safely run in server environment
// import { executeCode } from '../../code-executor';
// import { transactions } from '../../my-agent/cloud-billing-agent/src/data/transactions';

export type ValidSuite = TestSuite | 'all';

/**
 * Get tests for a specific suite or all tests
 */
export function getTestsForSuite(suite: ValidSuite): TestCase[] {
  if (suite === 'all') {
    return TEST_CASES;
  }
  return TEST_SUITES[suite] || [];
}

/**
 * Check if a response passes the test criteria
 */
export function checkResult(
  response: string,
  expectedContains: string[],
  expectedNotContains?: string[],
  suite?: TestSuite
): { passed: boolean; reason?: string } {
  // For codegen tests, validate the generated code (syntax validation only)
  // Code execution testing is disabled - see commented code below
  if (suite === 'codegen') {
    const codeValidation = validateGeneratedCode(response);
    
    // Check if code was generated
    if (!codeValidation.hasCodeBlock) {
      return {
        passed: false,
        reason: 'No code block found in response. Expected JavaScript code generation.',
      };
    }
    
    // Check syntax
    if (!codeValidation.isValid) {
      const syntaxErrors = codeValidation.syntaxErrors?.join('; ') || 'Unknown syntax errors';
      return {
        passed: false,
        reason: `Generated code has syntax errors: ${syntaxErrors}`,
      };
    }
    
    // Code execution testing temporarily disabled - causes 500 errors in server context
    // TODO: Re-enable when code execution can be safely run in server environment
    // if (codeValidation.codeSnippet) {
    //   try {
    //     const executionResult = executeCode(codeValidation.codeSnippet, transactions);
    //     if (!executionResult.success) {
    //       return {
    //         passed: false,
    //         reason: `Generated code failed to execute in sandbox: ${executionResult.error}`,
    //       };
    //     }
    //   } catch (error) {
    //     return {
    //       passed: false,
    //       reason: `Code execution test failed: ${error instanceof Error ? error.message : String(error)}`,
    //     };
    //   }
    // }
    
    // For code analysis tests, check if analysis is present
    const testName = expectedContains.join(' ').toLowerCase();
    if (testName.includes('explain') || testName.includes('review') || testName.includes('analysis')) {
      if (!hasCodeAnalysis(response)) {
        return {
          passed: false,
          reason: 'Code was generated but no analysis/explanation was provided',
        };
      }
    }
  }
  
  // Check that at least one expected string is present
  const hasExpected = expectedContains.some((expected) => response.includes(expected));

  if (!hasExpected) {
    return {
      passed: false,
      reason: `Expected one of [${expectedContains.join(', ')}] in response`,
    };
  }

  // Check that none of the forbidden strings are present
  if (expectedNotContains) {
    for (const forbidden of expectedNotContains) {
      if (response.includes(forbidden)) {
        return {
          passed: false,
          reason: `Found forbidden string "${forbidden}" in response`,
        };
      }
    }
  }

  return { passed: true };
}

/**
 * Run a single test case and yield progress events
 */
async function* runSingleTest(
  testCase: TestCase,
  testIndex: number
): AsyncGenerator<ValidationMessage> {
  yield { type: 'test_start', testIndex };

  // Step 0: Sending query
  yield { type: 'step', testIndex, stepIndex: 0, status: 'running' };

  let response = '';
  const pendingTools = new Map<string, { name: string; startTime: number }>();

  try {
    for await (const message of query({
      prompt: testCase.query,
      options: {
        systemPrompt: SYSTEM_PROMPT,
        mcpServers: {
          billing: billingServer,
        },
        model: MODEL,
        allowedTools: ['mcp__billing__*'],
        permissionMode: 'bypassPermissions',
      },
    })) {
      // Step 0 completed, step 1 (Processing) running
      yield { type: 'step', testIndex, stepIndex: 0, status: 'completed' };
      yield { type: 'step', testIndex, stepIndex: 1, status: 'running' };

      if (message.type === 'assistant') {
        for (const block of message.message.content) {
          if (block.type === 'text') {
            response += block.text;
            yield { type: 'text', content: block.text };
          } else if (block.type === 'tool_use') {
            // Step 2: Using tools
            yield { type: 'step', testIndex, stepIndex: 1, status: 'completed' };
            yield { type: 'step', testIndex, stepIndex: 2, status: 'running' };

            pendingTools.set(block.id, { name: block.name, startTime: Date.now() });
            yield {
              type: 'tool_use',
              toolName: block.name,
              input: block.input as Record<string, unknown>,
            };
          } else if (block.type === 'thinking' && 'thinking' in block) {
            yield { type: 'thinking', content: String(block.thinking) };
          }
        }
      } else if (message.type === 'user') {
        // Handle tool results
        const content = message.message.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === 'tool_result') {
              const toolInfo = pendingTools.get(block.tool_use_id);
              const toolName = toolInfo?.name || 'unknown';
              const elapsedMs = toolInfo ? Date.now() - toolInfo.startTime : 0;
              const blockContent = block.content;
              const result =
                typeof blockContent === 'string'
                  ? blockContent
                  : Array.isArray(blockContent)
                    ? blockContent
                        .map((c: { type: string; text?: string }) => (c.type === 'text' ? c.text : ''))
                        .join('')
                    : JSON.stringify(blockContent);

              yield { type: 'progress', toolName, elapsedMs };
              yield { type: 'tool_result', toolName, result };
            }
          }
        }
      }
    }

    // All processing done, move to validation
    yield { type: 'step', testIndex, stepIndex: 1, status: 'completed' };
    yield { type: 'step', testIndex, stepIndex: 2, status: 'completed' };
    yield { type: 'step', testIndex, stepIndex: 3, status: 'running' };

    // Validate the result
    const result = checkResult(response, testCase.expectedContains, testCase.expectedNotContains, testCase.suite);

    yield { type: 'step', testIndex, stepIndex: 3, status: result.passed ? 'completed' : 'failed' };
    yield {
      type: 'test_result',
      testIndex,
      passed: result.passed,
      response,
      reason: result.reason,
    };
  } catch (error) {
    console.error(`[VALIDATION] Error in test ${testIndex}:`, error);
    console.error(`[VALIDATION] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    yield { type: 'error', error: errorMessage, testIndex };
    yield { type: 'step', testIndex, stepIndex: 3, status: 'failed' };
    yield {
      type: 'test_result',
      testIndex,
      passed: false,
      response,
      reason: `Error: ${errorMessage}${errorStack ? `\nStack: ${errorStack}` : ''}`,
    };
  }
}

/**
 * Run validation tests for a specific suite and yield progress events
 */
export async function* runValidation(suite: ValidSuite = 'all'): AsyncGenerator<ValidationMessage> {
  try {
    const tests = getTestsForSuite(suite);
    
    for (let i = 0; i < tests.length; i++) {
      yield* runSingleTest(tests[i], i);
    }
    
    yield { type: 'done' };
  } catch (error) {
    console.error(`[VALIDATION] Fatal error in runValidation:`, error);
    console.error(`[VALIDATION] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    yield { 
      type: 'error', 
      error: error instanceof Error ? error.message : String(error),
      testIndex: undefined
    };
    yield { type: 'done' };
  }
}
