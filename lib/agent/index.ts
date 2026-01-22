// lib/agent/index.ts
// Agent implementation using the Cloud Billing Agent

import { query } from '@anthropic-ai/claude-agent-sdk';
import { AgentMessage } from './types';
import { SYSTEM_PROMPT, MODEL } from './constants';
import { billingServer } from '../../my-agent/cloud-billing-agent/src/tools/server';

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
      model: MODEL,
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
