// lib/agent/code-validator.ts
// Utilities to validate and analyze generated JavaScript code

export interface CodeValidationResult {
  isValid: boolean;
  hasCodeBlock: boolean;
  codeSnippet?: string;
  syntaxErrors?: string[];
  hasExpectedPatterns: {
    hasFilter: boolean;
    hasReduce: boolean;
    hasTransactions: boolean;
    hasAmount: boolean;
  };
  analysis?: {
    complexity: 'simple' | 'moderate' | 'complex';
    usesCorrectSchema: boolean;
    hasComments: boolean;
  };
}

/**
 * Extract JavaScript code from a response text
 * Looks for code blocks (```javascript or ```js or ```)
 */
export function extractCodeFromResponse(response: string): string | null {
  // Match code blocks with optional language specifier
  const codeBlockRegex = /```(?:javascript|js)?\s*\n([\s\S]*?)```/;
  const match = response.match(codeBlockRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  // Also check for inline code patterns (less common but possible)
  const inlineCodeRegex = /`([^`]+)`/g;
  const inlineMatches = Array.from(response.matchAll(inlineCodeRegex));
  
  // If we find a substantial inline code block, return it
  for (const match of inlineMatches) {
    if (match[1].length > 50 && (match[1].includes('filter') || match[1].includes('reduce'))) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Check if code contains expected patterns for billing calculations
 */
function checkExpectedPatterns(code: string): CodeValidationResult['hasExpectedPatterns'] {
  const normalized = code.toLowerCase();
  
  return {
    hasFilter: /\bfilter\s*\(/i.test(code) || normalized.includes('filter'),
    hasReduce: /\breduce\s*\(/i.test(code) || normalized.includes('reduce'),
    hasTransactions: /\btransactions\b/i.test(code),
    hasAmount: /\bamount\b/i.test(code) || normalized.includes('amount'),
  };
}

/**
 * Basic syntax validation using regex patterns
 * Note: This is not a full parser, but catches common issues
 */
function validateSyntax(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for balanced brackets
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push(`Unbalanced braces: ${openBraces} open, ${closeBraces} close`);
  }
  
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push(`Unbalanced parentheses: ${openParens} open, ${closeParens} close`);
  }
  
  const openBrackets = (code.match(/\[/g) || []).length;
  const closeBrackets = (code.match(/\]/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push(`Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`);
  }
  
  // Check for common syntax issues
  if (code.includes('=>') && !code.match(/\([^)]*\)\s*=>/)) {
    // Arrow function should have parentheses (basic check)
    if (!code.match(/=>\s*{/) && !code.match(/=>\s*[^{]/)) {
      // This is a weak check, but better than nothing
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Analyze code structure and quality
 */
function analyzeCode(code: string): CodeValidationResult['analysis'] {
  const hasComments = /\/\/|\/\*|\*\//.test(code);
  const usesTransactionSchema = 
    /\btransaction\b/i.test(code) || 
    /\btransactions\b/i.test(code) ||
    /\.(id|date|amount|service|status)\b/.test(code);
  
  // Determine complexity based on structure
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
  const methodCount = (code.match(/\.(filter|reduce|map|find|some|every)\s*\(/g) || []).length;
  
  if (methodCount > 2 || code.split('\n').length > 10) {
    complexity = 'complex';
  } else if (methodCount > 1 || code.split('\n').length > 5) {
    complexity = 'moderate';
  }
  
  return {
    complexity,
    usesCorrectSchema: usesTransactionSchema,
    hasComments,
  };
}

/**
 * Validate generated code from an agent response
 */
export function validateGeneratedCode(response: string): CodeValidationResult {
  const codeSnippet = extractCodeFromResponse(response);
  const hasCodeBlock = codeSnippet !== null;
  
  if (!hasCodeBlock || !codeSnippet) {
    return {
      isValid: false,
      hasCodeBlock: false,
      hasExpectedPatterns: {
        hasFilter: false,
        hasReduce: false,
        hasTransactions: false,
        hasAmount: false,
      },
    };
  }
  
  const syntaxCheck = validateSyntax(codeSnippet);
  const patterns = checkExpectedPatterns(codeSnippet);
  const analysis = analyzeCode(codeSnippet);
  
  // Code is valid if syntax is OK and has at least some expected patterns
  const isValid = syntaxCheck.isValid && (
    patterns.hasFilter || 
    patterns.hasReduce || 
    patterns.hasTransactions
  );
  
  return {
    isValid,
    hasCodeBlock: true,
    codeSnippet,
    syntaxErrors: syntaxCheck.errors.length > 0 ? syntaxCheck.errors : undefined,
    hasExpectedPatterns: patterns,
    analysis,
  };
}

/**
 * Check if response contains code analysis/explanation
 */
export function hasCodeAnalysis(response: string): boolean {
  const analysisKeywords = [
    'explains',
    'explanation',
    'explain',
    'analyzes',
    'analyze',
    'analysis',
    'review',
    'reviews',
    'step by step',
    'what this code',
    'this code does',
    'calculates',
    'filters',
    'reduces',
  ];
  
  const normalized = response.toLowerCase();
  return analysisKeywords.some(keyword => normalized.includes(keyword));
}
