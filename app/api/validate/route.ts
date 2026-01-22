import { runValidation } from '@/lib/agent/validation';

// Disable static generation for this route
export const dynamic = 'force-dynamic';

/**
 * POST /api/validate
 *
 * Streams validation test results using Server-Sent Events (SSE).
 *
 * Response: SSE stream with events:
 * - data: {"type":"test_start","testIndex":0}
 * - data: {"type":"step","testIndex":0,"stepIndex":0,"status":"running"}
 * - data: {"type":"thinking","content":"..."}
 * - data: {"type":"text","content":"..."}
 * - data: {"type":"tool_use","toolName":"...","input":{...}}
 * - data: {"type":"progress","toolName":"...","elapsedMs":123}
 * - data: {"type":"tool_result","toolName":"...","result":"..."}
 * - data: {"type":"test_result","testIndex":0,"passed":true,"response":"..."}
 * - data: {"type":"done"}
 */
export async function POST() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const message of runValidation()) {
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
      'X-Accel-Buffering': 'no',
    },
  });
}

/**
 * GET /api/validate
 *
 * Health check endpoint.
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'Validation API is running. Send POST requests to run the test suite.',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
