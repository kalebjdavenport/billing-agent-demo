import { NextResponse } from 'next/server';
import { transactions } from '@/my-agent/cloud-billing-agent/src/data/transactions';

// Disable static generation for this route
export const dynamic = 'force-dynamic';

/**
 * GET /api/transactions
 *
 * Returns the full transactions array for use in the code sandbox.
 */
export async function GET() {
  return NextResponse.json(transactions);
}
