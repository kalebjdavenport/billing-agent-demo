import { describe, it, expect } from 'vitest';
import { extractCodeFromResponse, validateGeneratedCode, hasCodeAnalysis } from './code-validator';

describe('code-validator', () => {
  describe('extractCodeFromResponse', () => {
    it('extracts code from JavaScript code block', () => {
      const response = `
Here's the code:

\`\`\`javascript
const total = transactions.filter(tx => tx.service.includes('EC2')).reduce((sum, tx) => sum + tx.amount, 0);
\`\`\`

This calculates the total.
      `;

      const result = extractCodeFromResponse(response);

      expect(result).toBeTruthy();
      expect(result).toContain('transactions');
      expect(result).toContain('filter');
    });

    it('extracts code from JS code block', () => {
      const response = `\`\`\`js\nconst x = 1;\n\`\`\``;

      const result = extractCodeFromResponse(response);

      expect(result).toBe('const x = 1;');
    });

    it('extracts code from code block without language', () => {
      const response = `\`\`\`\nconst y = 2;\n\`\`\``;

      const result = extractCodeFromResponse(response);

      expect(result).toBe('const y = 2;');
    });

    it('returns null when no code block found', () => {
      const response = 'This is just text with no code blocks.';

      const result = extractCodeFromResponse(response);

      expect(result).toBeNull();
    });

    it('extracts substantial inline code', () => {
      const response = `Here's some code: \`transactions.filter(tx => tx.amount > 100).reduce((sum, tx) => sum + tx.amount, 0)\` that does something.`;

      const result = extractCodeFromResponse(response);

      expect(result).toBeTruthy();
      expect(result).toContain('filter');
      expect(result).toContain('reduce');
    });

    it('ignores short inline code', () => {
      const response = `This has \`short\` inline code.`;

      const result = extractCodeFromResponse(response);

      expect(result).toBeNull();
    });
  });

  describe('validateGeneratedCode', () => {
    it('validates correct code with filter and reduce', () => {
      const response = `
Here's the code:

\`\`\`javascript
const total = transactions
  .filter(tx => tx.service.includes('EC2'))
  .reduce((sum, tx) => sum + tx.amount, 0);
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.isValid).toBe(true);
      expect(result.hasCodeBlock).toBe(true);
      expect(result.hasExpectedPatterns.hasFilter).toBe(true);
      expect(result.hasExpectedPatterns.hasReduce).toBe(true);
      expect(result.hasExpectedPatterns.hasTransactions).toBe(true);
      expect(result.syntaxErrors).toBeUndefined();
    });

    it('detects missing code block', () => {
      const response = 'This response has no code blocks.';

      const result = validateGeneratedCode(response);

      expect(result.isValid).toBe(false);
      expect(result.hasCodeBlock).toBe(false);
    });

    it('detects syntax errors - unbalanced braces', () => {
      const response = `
\`\`\`javascript
const x = { a: 1;
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.isValid).toBe(false);
      expect(result.syntaxErrors).toBeDefined();
      expect(result.syntaxErrors?.some(e => e.includes('braces'))).toBe(true);
    });

    it('detects syntax errors - unbalanced parentheses', () => {
      const response = `
\`\`\`javascript
const x = (1 + 2;
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.isValid).toBe(false);
      expect(result.syntaxErrors).toBeDefined();
      expect(result.syntaxErrors?.some(e => e.includes('parentheses'))).toBe(true);
    });

    it('detects syntax errors - unbalanced brackets', () => {
      const response = `
\`\`\`javascript
const arr = [1, 2, 3;
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.isValid).toBe(false);
      expect(result.syntaxErrors).toBeDefined();
      expect(result.syntaxErrors?.some(e => e.includes('brackets'))).toBe(true);
    });

    it('validates code with comments', () => {
      const response = `
\`\`\`javascript
// Calculate total EC2 spending
const total = transactions
  .filter(tx => tx.service.includes('EC2'))
  .reduce((sum, tx) => sum + tx.amount, 0);
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.isValid).toBe(true);
      expect(result.analysis?.hasComments).toBe(true);
    });

    it('detects code complexity - simple', () => {
      const response = `
\`\`\`javascript
const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.analysis?.complexity).toBe('simple');
    });

    it('detects code complexity - moderate', () => {
      const response = `
\`\`\`javascript
const ec2 = transactions.filter(tx => tx.service.includes('EC2'));
const total = ec2.reduce((sum, tx) => sum + tx.amount, 0);
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.analysis?.complexity).toBe('moderate');
    });

    it('detects code complexity - complex', () => {
      const response = `
\`\`\`javascript
const byService = transactions.reduce((acc, tx) => {
  const service = tx.service;
  acc[service] = (acc[service] || 0) + tx.amount;
  return acc;
}, {});

const ec2 = transactions.filter(tx => tx.service.includes('EC2'));
const pending = transactions.filter(tx => tx.status === 'pending');
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.analysis?.complexity).toBe('complex');
    });

    it('detects transaction schema usage', () => {
      const response = `
\`\`\`javascript
const total = transactions
  .filter(tx => tx.service.includes('EC2'))
  .reduce((sum, tx) => sum + tx.amount, 0);
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.analysis?.usesCorrectSchema).toBe(true);
    });

    it('validates code with amount property', () => {
      const response = `
\`\`\`javascript
const highValue = transactions.filter(tx => tx.amount > 100);
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      expect(result.hasExpectedPatterns.hasAmount).toBe(true);
      expect(result.hasExpectedPatterns.hasTransactions).toBe(true);
    });

    it('fails validation for code without expected patterns', () => {
      const response = `
\`\`\`javascript
const x = 1 + 2;
console.log(x);
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      // Code has no transactions, filter, or reduce - should be invalid
      expect(result.isValid).toBe(false);
    });

    it('validates code with only transactions reference', () => {
      const response = `
\`\`\`javascript
console.log('Total transactions:', transactions.length);
\`\`\`
      `;

      const result = validateGeneratedCode(response);

      // Has transactions reference, should be valid
      expect(result.isValid).toBe(true);
      expect(result.hasExpectedPatterns.hasTransactions).toBe(true);
    });
  });

  describe('hasCodeAnalysis', () => {
    it('detects explanation keywords', () => {
      const response = 'This code explains how to calculate the total.';

      expect(hasCodeAnalysis(response)).toBe(true);
    });

    it('detects analysis keywords', () => {
      const response = 'Let me analyze this code for you.';

      expect(hasCodeAnalysis(response)).toBe(true);
    });

    it('detects review keywords', () => {
      const response = 'I will review the code now.';

      expect(hasCodeAnalysis(response)).toBe(true);
    });

    it('detects step-by-step explanation', () => {
      const response = 'Here is a step by step explanation of the code.';

      expect(hasCodeAnalysis(response)).toBe(true);
    });

    it('detects "what this code does"', () => {
      const response = 'This code does the following:';

      expect(hasCodeAnalysis(response)).toBe(true);
    });

    it('detects calculates keyword', () => {
      const response = 'The code calculates the total amount.';

      expect(hasCodeAnalysis(response)).toBe(true);
    });

    it('returns false for responses without analysis', () => {
      const response = 'Here is some code: const x = 1;';

      expect(hasCodeAnalysis(response)).toBe(false);
    });

    it('is case insensitive', () => {
      const response = 'This EXPLAINS the code.';

      expect(hasCodeAnalysis(response)).toBe(true);
    });
  });
});
