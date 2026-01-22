// lib/code-executor.ts
// Safe code execution for the code sandbox

import { BillingTransaction } from '@/my-agent/cloud-billing-agent/src/data/transactions';

export interface ExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime: number;
}

/**
 * Execute JavaScript code in a controlled environment
 * Only exposes the transactions array and basic console methods
 */
export function executeCode(
  code: string,
  transactions: BillingTransaction[]
): ExecutionResult {
  // Use performance.now() if available (browser), otherwise Date.now() (Node)
  const startTime = typeof performance !== 'undefined' && performance.now 
    ? performance.now() 
    : Date.now();

  try {
    if (!code || typeof code !== 'string') {
      throw new Error('Code must be a non-empty string');
    }
    
    if (!Array.isArray(transactions)) {
      throw new Error('Transactions must be an array');
    }
    // Create a controlled execution context
    // Only expose transactions and console methods
    const consoleOutput: string[] = [];
    const safeConsole = {
      log: (...args: unknown[]) => {
        consoleOutput.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '));
      },
      error: (...args: unknown[]) => {
        consoleOutput.push('ERROR: ' + args.map(String).join(' '));
      },
      warn: (...args: unknown[]) => {
        consoleOutput.push('WARN: ' + args.map(String).join(' '));
      },
    };

    // Wrap code in an IIFE to prevent global scope pollution
    // Check if code starts with a return statement (top-level return)
    const trimmedCode = code.trim();
    const hasTopLevelReturn = /^\s*return\b/.test(trimmedCode);
    
    let wrappedCode: string;
    if (hasTopLevelReturn) {
      // For code with top-level return, wrap it to capture the return value
      // The IIFE will return the value, and we need to return that from the Function
      wrappedCode = `
        return (function() {
          const transactions = ${JSON.stringify(transactions)};
          ${code}
        })();
      `;
    } else {
      wrappedCode = `
        (function() {
          const transactions = ${JSON.stringify(transactions)};
          ${code}
        })();
      `;
    }

    // Execute the code
    const result = new Function('console', wrappedCode)(safeConsole);

    const endTime = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const executionTime = endTime - startTime;

    // If there's console output, return that; otherwise return the result
    if (consoleOutput.length > 0) {
      return {
        success: true,
        result: consoleOutput.join('\n'),
        executionTime,
      };
    }

    // If code had a top-level return statement, the IIFE result is the return value
    if (hasTopLevelReturn) {
      return {
        success: true,
        result: result !== undefined ? result : 'Code executed successfully (no return value)',
        executionTime,
      };
    }

    // For code without return, result is undefined (IIFE doesn't return)
    return {
      success: true,
      result: result !== undefined ? result : 'Code executed successfully (no return value)',
      executionTime,
    };
  } catch (error) {
    const endTime = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const executionTime = endTime - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime,
    };
  }
}

/**
 * Extract code from markdown code blocks
 */
export function extractCodeFromMarkdown(text: string): string | null {
  const codeBlockRegex = /```(?:javascript|js)?\s*\n([\s\S]*?)```/;
  const match = text.match(codeBlockRegex);
  return match ? match[1].trim() : null;
}
