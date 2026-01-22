import { describe, it, expect } from 'vitest';
import { GET } from './route';
import { transactions } from '@/my-agent/cloud-billing-agent/src/data/transactions';

describe('GET /api/transactions', () => {
  it('returns transactions array', async () => {
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('returns all transactions', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.length).toBe(transactions.length);
  });

  it('returns transactions with correct structure', async () => {
    const response = await GET();
    const data = await response.json();

    if (data.length > 0) {
      const firstTx = data[0];
      expect(firstTx).toHaveProperty('id');
      expect(firstTx).toHaveProperty('date');
      expect(firstTx).toHaveProperty('amount');
      expect(firstTx).toHaveProperty('service');
      expect(firstTx).toHaveProperty('status');
    }
  });

  it('returns JSON content type', async () => {
    const response = await GET();

    expect(response.headers.get('content-type')).toContain('application/json');
  });

  it('returns same data as source', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data).toEqual(transactions);
  });
});
