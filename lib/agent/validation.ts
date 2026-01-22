// lib/agent/validation.ts
// Validation test runner with real-time streaming (server-only)

import { query } from '@anthropic-ai/claude-agent-sdk';
import { billingServer } from '../../my-agent/cloud-billing-agent/src/tools/server';
import { TestCase, ValidationMessage } from './types';
import { TEST_CASES } from './validation-constants';

const SYSTEM_PROMPT = `You are a cloud billing assistant that helps users understand and analyze their AWS cloud spending.

Your capabilities:
- Query billing transactions by date range, service, or status
- Provide spending summaries and breakdowns by service or month
- Identify pending charges and recent transactions
- Answer questions about billing history and cost trends

Guidelines:
1. Use the available billing tools to retrieve accurate data before answering questions
2. Present monetary values clearly with dollar signs and appropriate formatting
3. When reporting totals or answering queries, include the transaction table showing the relevant charges by default - don't ask if they want to see details
4. Only group or break down by service/month if the user specifically asks for a breakdown
5. Be concise and data-focused - provide the summary and data directly rather than asking follow-up questions
5. If asked about something unrelated to billing, costs, or cloud spending, politely explain that you can only help with billing-related queries

Today's date is January 22, 2026. Billing data is available from January 2025 through the current month.`;

/**
 * Check if a response passes the test criteria
 */
export function checkResult(
  response: string,
  expectedContains: string[],
  expectedNotContains?: string[]
): { passed: boolean; reason?: string } {
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
        model: 'claude-sonnet-4-20250514',
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
    const result = checkResult(response, testCase.expectedContains, testCase.expectedNotContains);

    yield { type: 'step', testIndex, stepIndex: 3, status: result.passed ? 'completed' : 'failed' };
    yield {
      type: 'test_result',
      testIndex,
      passed: result.passed,
      response,
      reason: result.reason,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    yield { type: 'error', error: errorMessage, testIndex };
    yield { type: 'step', testIndex, stepIndex: 3, status: 'failed' };
    yield {
      type: 'test_result',
      testIndex,
      passed: false,
      response,
      reason: `Error: ${errorMessage}`,
    };
  }
}

/**
 * Run all validation tests and yield progress events
 */
export async function* runValidation(): AsyncGenerator<ValidationMessage> {
  for (let i = 0; i < TEST_CASES.length; i++) {
    yield* runSingleTest(TEST_CASES[i], i);
  }
  yield { type: 'done' };
}
