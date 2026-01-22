// Filtering tools - PLACEHOLDER
// Replace with your actual tool definitions using the tool() helper

import { z } from 'zod';

/**
 * Example filtering tool schemas using Zod.
 *
 * These schemas define the input validation for your filtering tools.
 * When you implement the real agent, you can use these with the tool() helper:
 *
 * ```typescript
 * import { tool } from '@anthropic-ai/claude-agent-sdk';
 *
 * export const filteringTools = [
 *   tool({
 *     name: 'query_billing',
 *     description: 'Query billing data with filters',
 *     schema: billingQuerySchema,
 *     handler: async (input) => {
 *       // Your implementation
 *       return JSON.stringify(results);
 *     },
 *   }),
 *   tool({
 *     name: 'query_code',
 *     description: 'Query code documentation with filters',
 *     schema: codeQuerySchema,
 *     handler: async (input) => {
 *       // Your implementation
 *       return JSON.stringify(results);
 *     },
 *   }),
 * ];
 * ```
 */

// Billing query schema
export const billingQuerySchema = z.object({
  startDate: z.string().optional().describe('Start date in YYYY-MM-DD format'),
  endDate: z.string().optional().describe('End date in YYYY-MM-DD format'),
  service: z.string().optional().describe('Service name to filter by'),
  status: z
    .enum(['pending', 'paid', 'overdue', 'cancelled'])
    .optional()
    .describe('Transaction status'),
  minAmount: z.number().optional().describe('Minimum transaction amount'),
  maxAmount: z.number().optional().describe('Maximum transaction amount'),
});

export type BillingQuery = z.infer<typeof billingQuerySchema>;

// Code documentation query schema
export const codeQuerySchema = z.object({
  path: z.string().optional().describe('File or directory path to document'),
  branch: z.string().optional().describe('Git branch to use'),
  includePrivate: z.boolean().optional().describe('Include private members in documentation'),
  format: z.enum(['markdown', 'html', 'json']).optional().describe('Output format'),
});

export type CodeQuery = z.infer<typeof codeQuerySchema>;

// Generic filter schema that can be extended
export const genericFilterSchema = z.object({
  query: z.string().describe('Search query string'),
  filters: z.record(z.string(), z.unknown()).optional().describe('Additional filters as key-value pairs'),
  limit: z.number().optional().default(10).describe('Maximum number of results'),
  offset: z.number().optional().default(0).describe('Offset for pagination'),
});

export type GenericFilter = z.infer<typeof genericFilterSchema>;
