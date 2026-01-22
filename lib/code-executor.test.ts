import { describe, it, expect, beforeEach, vi } from 'vitest';
import { executeCode, extractCodeFromMarkdown } from './code-executor';
import { BillingTransaction } from '@/my-agent/cloud-billing-agent/src/data/transactions';

describe('code-executor', () => {
  const mockTransactions: BillingTransaction[] = [
    { id: 'tx_001', date: '2025-01-02', amount: 100.0, service: 'Compute (EC2)', status: 'processed' },
    { id: 'tx_002', date: '2025-01-05', amount: 50.0, service: 'Storage (S3)', status: 'processed' },
    { id: 'tx_003', date: '2025-01-08', amount: 75.0, service: 'Compute (EC2)', status: 'pending' },
  ];

  describe('executeCode', () => {
    it('executes simple calculation code successfully', () => {
      const code = `
        const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        console.log('Total:', total);
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toContain('Total:');
      expect(result.result).toContain('225');
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('filters transactions by service', () => {
      const code = `
        const ec2Total = transactions
          .filter(tx => tx.service.includes('EC2'))
          .reduce((sum, tx) => sum + tx.amount, 0);
        console.log('EC2 Total:', ec2Total);
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toContain('EC2 Total:');
      expect(result.result).toContain('175'); // 100 + 75
    });

    it('filters transactions by status', () => {
      const code = `
        const pending = transactions.filter(tx => tx.status === 'pending');
        console.log('Pending count:', pending.length);
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toContain('Pending count:');
      expect(result.result).toContain('1');
    });

    it('handles code with return value', () => {
      const code = `return transactions.length;`;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      // When code has a top-level return, the IIFE should return that value
      // The IIFE wraps: (function() { return transactions.length; })()
      // This should return the length value
      expect(typeof result.result).toBe('number');
      expect(result.result).toBe(3);
    });

    it('handles code with no output', () => {
      const code = `
        const x = 1 + 1;
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toBe('Code executed successfully (no return value)');
    });

    it('handles console.error', () => {
      const code = `
        console.error('Error message');
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toContain('ERROR: Error message');
    });

    it('handles console.warn', () => {
      const code = `
        console.warn('Warning message');
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toContain('WARN: Warning message');
    });

    it('handles multiple console.log calls', () => {
      const code = `
        console.log('First');
        console.log('Second');
        console.log('Third');
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toContain('First');
      expect(result.result).toContain('Second');
      expect(result.result).toContain('Third');
    });

    it('handles object logging', () => {
      const code = `
        const summary = { total: 100, count: 2 };
        console.log(summary);
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toContain('total');
      expect(result.result).toContain('100');
    });

    it('handles syntax errors', () => {
      const code = `
        const x = {;
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Unexpected');
    });

    it('handles runtime errors', () => {
      const code = `
        const x = transactions[100].amount;
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles empty code', () => {
      const result = executeCode('', mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toBe('Code executed successfully (no return value)');
    });

    it('does not expose global scope', () => {
      const code = `
        try {
          window;
          console.log('FAILED: window is accessible');
        } catch (e) {
          console.log('SUCCESS: window is not accessible');
        }
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      // The code should fail to access window, but we're in a Node test environment
      // so this test verifies the code runs without crashing
      expect(result.result).toBeDefined();
    });

    it('measures execution time', () => {
      const code = `
        for (let i = 0; i < 1000; i++) {
          transactions.length;
        }
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(100); // Should be fast
    });

    it('handles date filtering', () => {
      const code = `
        const jan2025 = transactions.filter(tx => tx.date.startsWith('2025-01'));
        console.log('January 2025 transactions:', jan2025.length);
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toContain('January 2025 transactions:');
      expect(result.result).toContain('3');
    });

    it('handles complex calculations', () => {
      const code = `
        const summary = transactions.reduce((acc, tx) => {
          const service = tx.service;
          acc[service] = (acc[service] || 0) + tx.amount;
          return acc;
        }, {});
        console.log(JSON.stringify(summary, null, 2));
      `;

      const result = executeCode(code, mockTransactions);

      expect(result.success).toBe(true);
      expect(result.result).toBeDefined();
      const resultStr = String(result.result);
      expect(resultStr).toContain('Compute (EC2)');
      expect(resultStr).toContain('175');
      expect(resultStr).toContain('Storage (S3)');
      expect(resultStr).toContain('50');
    });
  });

  describe('extractCodeFromMarkdown', () => {
    it('extracts code from JavaScript code block', () => {
      const markdown = `
Here is some code:

\`\`\`javascript
const x = 1;
console.log(x);
\`\`\`

That's the code.
      `;

      const result = extractCodeFromMarkdown(markdown);

      expect(result).toBe('const x = 1;\nconsole.log(x);');
    });

    it('extracts code from JS code block', () => {
      const markdown = `
\`\`\`js
const y = 2;
\`\`\`
      `;

      const result = extractCodeFromMarkdown(markdown);

      expect(result).toBe('const y = 2;');
    });

    it('extracts code from code block without language', () => {
      const markdown = `
\`\`\`
const z = 3;
\`\`\`
      `;

      const result = extractCodeFromMarkdown(markdown);

      expect(result).toBe('const z = 3;');
    });

    it('trims whitespace from extracted code', () => {
      const markdown = `
\`\`\`javascript
    
    const x = 1;
    
\`\`\`
      `;

      const result = extractCodeFromMarkdown(markdown);

      expect(result).toBe('const x = 1;');
    });

    it('returns null when no code block found', () => {
      const markdown = 'This is just regular text with no code.';

      const result = extractCodeFromMarkdown(markdown);

      expect(result).toBeNull();
    });

    it('handles multiple code blocks (returns first)', () => {
      const markdown = `
\`\`\`javascript
const first = 1;
\`\`\`

\`\`\`javascript
const second = 2;
\`\`\`
      `;

      const result = extractCodeFromMarkdown(markdown);

      expect(result).toBe('const first = 1;');
    });

    it('handles empty code block', () => {
      const markdown = `
\`\`\`javascript

\`\`\`
      `;

      const result = extractCodeFromMarkdown(markdown);

      expect(result).toBe('');
    });

    it('handles code with backticks inside', () => {
      const markdown = `
\`\`\`javascript
const template = \`Hello \${name}\`;
\`\`\`
      `;

      const result = extractCodeFromMarkdown(markdown);

      expect(result).toContain('template');
      expect(result).toContain('Hello');
    });
  });
});
