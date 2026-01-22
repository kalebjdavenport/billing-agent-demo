// lib/agent/index.ts
// Agent implementation using the Anthropic API directly with tool use

import Anthropic from '@anthropic-ai/sdk';
import { AgentMessage } from './types';
import { SYSTEM_PROMPT, MODEL } from './constants';
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

/**
 * Run an agent query using the Anthropic API with tool use.
 * Streams results as an async generator of AgentMessage events.
 */
export async function* runAgentQuery(prompt: string): AsyncGenerator<AgentMessage> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: prompt }];

  let turns = 0;

  while (turns < MAX_TURNS) {
    turns++;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Process the response content
    const toolUseBlocks: Anthropic.ToolUseBlock[] = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        yield { type: 'text', content: block.text };
      } else if (block.type === 'tool_use') {
        toolUseBlocks.push(block);
        yield {
          type: 'tool_use',
          toolName: block.name,
          input: block.input as Record<string, unknown>,
        };
      }
    }

    // If there are no tool uses or stop reason is end_turn, we're done
    if (response.stop_reason === 'end_turn' || toolUseBlocks.length === 0) {
      break;
    }

    // Execute tools and add results to messages
    const assistantMessage: Anthropic.MessageParam = {
      role: 'assistant',
      content: response.content,
    };
    messages.push(assistantMessage);

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      const result = executeTool(toolUse.name, toolUse.input as ToolInput);
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

  yield { type: 'done' };
}

export type { AgentMessage } from './types';
