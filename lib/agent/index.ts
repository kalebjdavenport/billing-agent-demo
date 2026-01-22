// lib/agent/index.ts
// Agent implementation using the Cloud Billing Agent

import { query } from '@anthropic-ai/claude-agent-sdk';
import { AgentMessage } from './types';
import { billingServer } from '../../my-agent/cloud-billing-agent/src/tools/server';

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
 * Run an agent query using the Cloud Billing Agent tools.
 * Streams results as an async generator of AgentMessage events.
 */
export async function* runAgentQuery(prompt: string): AsyncGenerator<AgentMessage> {
  // Track pending tool calls to match results
  const pendingTools = new Map<string, string>();

  for await (const message of query({
    prompt,
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
    if (message.type === 'assistant') {
      for (const block of message.message.content) {
        if (block.type === 'text') {
          yield { type: 'text', content: block.text };
        } else if (block.type === 'tool_use') {
          pendingTools.set(block.id, block.name);
          yield { type: 'tool_use', toolName: block.name, input: block.input as Record<string, unknown> };
        } else if (block.type === 'tool_result') {
          const toolName = pendingTools.get(block.tool_use_id) || 'unknown';
          const result = Array.isArray(block.content)
            ? block.content.map((c: { type: string; text?: string }) => c.type === 'text' ? c.text : '').join('')
            : String(block.content);
          yield { type: 'tool_result', toolName, result };
        }
      }
    } else if (message.type === 'user') {
      // Handle tool results from user messages (SDK creates these after tool execution)
      const content = message.message.content;
      if (Array.isArray(content)) {
        for (const block of content) {
          if (block.type === 'tool_result') {
            const toolUseId = block.tool_use_id;
            const toolName = pendingTools.get(toolUseId) || 'unknown';
            const blockContent = block.content;
            const result = typeof blockContent === 'string'
              ? blockContent
              : Array.isArray(blockContent)
                ? blockContent.map((c: { type: string; text?: string }) => c.type === 'text' ? c.text : '').join('')
                : JSON.stringify(blockContent);
            yield { type: 'tool_result', toolName, result };
          }
        }
      }
    }
  }
  yield { type: 'done' };
}

export type { AgentMessage } from './types';
