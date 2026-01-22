import { NextRequest } from 'next/server';
import { runAgentQuery } from '@/lib/agent';
import { AgentRequest } from '@/lib/agent/types';

// Disable static generation for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/agent
 *
 * Streams agent responses using Server-Sent Events (SSE).
 *
 * Request body:
 * ```json
 * { "prompt": "Your query here" }
 * ```
 *
 * Response: SSE stream with events:
 * - data: {"type":"text","content":"..."}
 * - data: {"type":"tool_use","toolName":"...","input":{...}}
 * - data: {"type":"tool_result","toolName":"...","result":"..."}
 * - data: {"type":"done"}
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AgentRequest;
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'prompt is required and must be a string' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const message of runAgentQuery(prompt)) {
            const data = `data: ${JSON.stringify(message)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch (error) {
          // Send error as SSE event
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          const errorData = `data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering if present
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

/**
 * GET /api/agent
 *
 * Health check endpoint.
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'Agent API is running. Send POST requests with { "prompt": "..." } to query.',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
