// lib/agent/validation.ts
// Validation test runner with real-time streaming (server-only)

import Anthropic from '@anthropic-ai/sdk';
import { TestCase, TestSuite, ValidationMessage } from './types';
import { TEST_CASES, TEST_SUITES } from './validation-constants';
import { SYSTEM_PROMPT, MODEL } from './constants';
import { validateGeneratedCode, hasCodeAnalysis } from './code-validator';
import {
  transactions,
  filterTransactions,
  getUniqueServices,
  getDateRange as getDataDateRange,
  aggregateByField,
  BillingTransaction,
} from '../../my-agent/cloud-billing-agent/src/data/transactions';

const MAX_TABLE_ROWS = 8;
const MAX_BREAKDOWN_ROWS = 12;
const MAX_TURNS = 5;

// Initialize Anthropic client
const anthropic = new Anthropic();

// Tool definitions in Anthropic API format
const tools: Anthropic.Tool[] = [
  {
    name: 'query_transactions',
    description:
      'Query billing transactions with optional filters for date range, service, and status. Returns matching transactions with a summary.',
    input_schema: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        service: {
          type: 'string',
          description: 'Filter by service name (partial match)',
        },
        status: {
          type: 'string',
          enum: ['processed', 'pending'],
          description: 'Filter by transaction status',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_billing_summary',
    description:
      'Get aggregated billing totals for a date range, optionally grouped by service, month, or status. Returns total amount and transaction count.',
    input_schema: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        group_by: {
          type: 'string',
          enum: ['service', 'month', 'status'],
          description: 'Group results by field',
        },
      },
      required: [],
    },
  },
  {
    name: 'list_services',
    description:
      'List all unique services available in the billing data. Use this to discover valid service names for filtering.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_date_range',
    description:
      'Get the date range of available billing data (earliest and latest dates). Use this to understand data boundaries before querying.',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// Helper to format transactions as a markdown table
function formatTransactionsTable(txs: BillingTransaction[]): string {
  if (txs.length === 0) {
    const range = getDataDateRange(transactions);
    const services = getUniqueServices(transactions);
    return (
      `No transactions found for the given filters.\n\n` +
      `**Available data:**\n` +
      `- Date range: ${range.earliest} to ${range.latest}\n` +
      `- Services: ${services.slice(0, 5).join(', ')}${services.length > 5 ? ` (+${services.length - 5} more)` : ''}`
    );
  }

  const header = '| ID | Date | Amount | Service | Status |\n|-----|------|--------|---------|--------|';
  const displayTxs = txs.slice(0, MAX_TABLE_ROWS);
  const remaining = txs.length - displayTxs.length;
  const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0);

  const rows = displayTxs
    .map((tx) => `| ${tx.id} | ${tx.date} | $${tx.amount.toFixed(2)} | ${tx.service} | ${tx.status} |`)
    .join('\n');

  let table = `${header}\n${rows}`;

  if (remaining > 0) {
    const remainingTotal = txs.slice(MAX_TABLE_ROWS).reduce((sum, tx) => sum + tx.amount, 0);
    table += `\n\n*... and ${remaining} more transaction${remaining !== 1 ? 's' : ''} ($${remainingTotal.toFixed(2)} additional)*`;
  }

  table += `\n\n**Summary:** ${txs.length} transactions totaling $${totalAmount.toFixed(2)}`;

  return table;
}

// Helper to format breakdown as a markdown table
function formatBreakdownTable(breakdown: Record<string, number>): string {
  const entries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  const header = '| Category | Amount |\n|----------|--------|';

  const displayEntries = entries.slice(0, MAX_BREAKDOWN_ROWS);
  const remaining = entries.length - displayEntries.length;

  const rows = displayEntries.map(([key, amount]) => `| ${key} | $${amount.toFixed(2)} |`).join('\n');

  let table = `${header}\n${rows}`;

  if (remaining > 0) {
    const remainingTotal = entries.slice(MAX_BREAKDOWN_ROWS).reduce((sum, [, amount]) => sum + amount, 0);
    table += `\n| *... ${remaining} more* | *$${remainingTotal.toFixed(2)}* |`;
  }

  return table;
}

// Tool execution handlers
interface ToolInput {
  start_date?: string;
  end_date?: string;
  service?: string;
  status?: 'processed' | 'pending';
  group_by?: 'service' | 'month' | 'status';
}

function executeTool(name: string, input: ToolInput): string {
  switch (name) {
    case 'query_transactions': {
      const results = filterTransactions(transactions, {
        start_date: input.start_date,
        end_date: input.end_date,
        service: input.service,
        status: input.status,
      });
      return `**${results.length} transaction${results.length !== 1 ? 's' : ''} found**\n\n${formatTransactionsTable(results)}`;
    }

    case 'get_billing_summary': {
      const filtered = filterTransactions(transactions, {
        start_date: input.start_date,
        end_date: input.end_date,
      });

      if (filtered.length === 0) {
        const range = getDataDateRange(transactions);
        return (
          `**No transactions found** for the specified date range.\n\n` +
          `Available data: ${range.earliest} to ${range.latest}`
        );
      }

      const total = filtered.reduce((sum: number, tx) => sum + tx.amount, 0);
      const breakdown = input.group_by ? aggregateByField(filtered, input.group_by) : undefined;

      let markdown = `**Total: $${(Math.round(total * 100) / 100).toFixed(2)}**\n\n`;
      markdown += `Based on ${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`;

      if (breakdown && Object.keys(breakdown).length > 0) {
        markdown += `\n\n**Breakdown by ${input.group_by}:**\n\n${formatBreakdownTable(breakdown)}`;
      }

      return markdown;
    }

    case 'list_services': {
      const services = getUniqueServices(transactions);
      return `**Available Services (${services.length}):**\n\n${services.map((s) => `- ${s}`).join('\n')}`;
    }

    case 'get_date_range': {
      const range = getDataDateRange(transactions);
      const totalCount = transactions.length;
      return `**Data Range:**\n\n| | Date |\n|--|------|\n| Earliest | ${range.earliest} |\n| Latest | ${range.latest} |\n\n*${totalCount} total transactions available*`;
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

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
async function* runSingleTest(testCase: TestCase, testIndex: number): AsyncGenerator<ValidationMessage> {
  yield { type: 'test_start', testIndex };

  // Step 0: Sending query
  yield { type: 'step', testIndex, stepIndex: 0, status: 'running' };

  let response = '';
  const pendingTools = new Map<string, { name: string; startTime: number }>();

  try {
    const messages: Anthropic.MessageParam[] = [{ role: 'user', content: testCase.query }];

    let turns = 0;

    while (turns < MAX_TURNS) {
      turns++;

      const apiResponse = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });

      // Step 0 completed, step 1 (Processing) running
      yield { type: 'step', testIndex, stepIndex: 0, status: 'completed' };
      yield { type: 'step', testIndex, stepIndex: 1, status: 'running' };

      // Process the response content
      const toolUseBlocks: Anthropic.ToolUseBlock[] = [];

      for (const block of apiResponse.content) {
        if (block.type === 'text') {
          response += block.text;
          yield { type: 'text', content: block.text };
        } else if (block.type === 'tool_use') {
          // Step 2: Using tools
          yield { type: 'step', testIndex, stepIndex: 1, status: 'completed' };
          yield { type: 'step', testIndex, stepIndex: 2, status: 'running' };

          toolUseBlocks.push(block);
          pendingTools.set(block.id, { name: block.name, startTime: Date.now() });
          yield {
            type: 'tool_use',
            toolName: block.name,
            input: block.input as Record<string, unknown>,
          };
        }
      }

      // If there are no tool uses or stop reason is end_turn, we're done
      if (apiResponse.stop_reason === 'end_turn' || toolUseBlocks.length === 0) {
        break;
      }

      // Execute tools and add results to messages
      const assistantMessage: Anthropic.MessageParam = {
        role: 'assistant',
        content: apiResponse.content,
      };
      messages.push(assistantMessage);

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const toolUse of toolUseBlocks) {
        const toolInfo = pendingTools.get(toolUse.id);
        const elapsedMs = toolInfo ? Date.now() - toolInfo.startTime : 0;
        const result = executeTool(toolUse.name, toolUse.input as ToolInput);

        yield { type: 'progress', toolName: toolUse.name, elapsedMs };
        yield { type: 'tool_result', toolName: toolUse.name, result };

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      const userMessage: Anthropic.MessageParam = {
        role: 'user',
        content: toolResults,
      };
      messages.push(userMessage);
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
      testIndex: undefined,
    };
    yield { type: 'done' };
  }
}
