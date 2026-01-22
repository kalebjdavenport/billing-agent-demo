# Enhanced Test Plan for Code Generation and Analysis

## Overview

This document outlines the improved testing strategy for validating code generation and code analysis capabilities in the billing agent.

## Problem Statement

Previously, the agent was declining code generation requests because:
1. The system prompt was too restrictive, treating all "coding help" as off-topic
2. The distinction between general coding help and billing-related codegen was unclear
3. Test validation only checked for keywords, not code quality or analysis

## Solution

### 1. System Prompt Improvements

**Before:** Prompt declined all "Coding help" requests

**After:** Prompt now distinguishes between:
- **General coding help** (decline): "help me write a Python function", "how do I sort a list"
- **Billing-related codegen** (allow): "show me code to calculate EC2 spend", "generate code for my billing total"

**Key Changes:**
- Added explicit exception for billing-related code generation
- Clarified when to generate code vs. use tools
- Added guidance for code analysis requests

### 2. Enhanced Test Cases

#### Code Generation Tests

1. **Basic Code Generation**
   - Query: "Show me JavaScript code to calculate my total EC2 spend"
   - Validates: Code block present, uses filter/reduce pattern, references transactions

2. **Date-Filtered Code**
   - Query: "Generate code to calculate my total spending for December 2025"
   - Validates: Date filtering logic, proper aggregation

3. **Status-Based Code**
   - Query: "What JavaScript code would I use to find all pending charges?"
   - Validates: Status filtering, correct schema usage

#### Code Analysis Tests

4. **Code Explanation**
   - Query: "Show me code to calculate EC2 spend, then explain what that code does"
   - Validates: Code generation + step-by-step explanation

5. **Code Review**
   - Query: "Generate code to sum all S3 charges, then review the code for any issues"
   - Validates: Code generation + analysis/review of code quality

### 3. Code Validation Utility

Created `lib/agent/code-validator.ts` with capabilities:

- **Code Extraction**: Extracts JavaScript from markdown code blocks
- **Syntax Validation**: Checks for balanced brackets, parentheses, basic syntax
- **Pattern Detection**: Verifies expected patterns (filter, reduce, transactions, amount)
- **Code Analysis**: Detects complexity, schema usage, comments
- **Analysis Detection**: Identifies if response contains code explanation

### 4. Enhanced Validation Logic

The validation system now:
- Automatically validates code syntax for codegen tests
- Checks for code blocks in responses
- Verifies code analysis is present when requested
- Provides detailed failure reasons

## Running Tests

### Web UI
Navigate to `/validate` and select the `codegen` suite

### CLI
```bash
cd my-agent/cloud-billing-agent
npx tsx tests/verify.ts codegen
```

## Test Validation Criteria

### Code Generation Tests Must:
1. ✅ Generate valid JavaScript code in a code block
2. ✅ Use correct transaction schema (id, date, amount, service, status)
3. ✅ Include expected patterns (filter, reduce, transactions)
4. ✅ Have valid syntax (balanced brackets, parentheses)
5. ✅ NOT decline the request (no "billing assistant can only help" messages)

### Code Analysis Tests Must:
1. ✅ Meet all code generation criteria
2. ✅ Include explanation/analysis of the code
3. ✅ Explain what the code does step-by-step
4. ✅ Review code quality if requested

## Expected Behavior

### ✅ Should Generate Code For:
- "Show me code to calculate EC2 spend"
- "Generate JavaScript for my monthly total"
- "How would I compute pending charges?"
- "What's the code to find S3 costs?"

### ❌ Should Decline:
- "Help me write a Python function"
- "How do I sort a list in JavaScript?"
- "Can you write a React component?"

### ✅ Should Analyze Code For:
- "Show me code, then explain it"
- "Generate code and review it"
- "What does this code do?" (after generating)

## Debugging Failed Tests

If a codegen test fails:

1. **Check the response**: Does it contain a code block?
2. **Check syntax**: Run the code validator manually
3. **Check patterns**: Does it use filter/reduce?
4. **Check decline**: Did the agent decline instead of generating?

### Manual Code Validation

```typescript
import { validateGeneratedCode } from '@/lib/agent/code-validator';

const result = validateGeneratedCode(agentResponse);
console.log(result);
// Check: result.isValid, result.hasCodeBlock, result.syntaxErrors
```

## Future Enhancements

Potential improvements:
1. Execute generated code in a sandbox to verify it runs
2. Compare generated code output with tool results
3. Test code modification requests ("make it more efficient")
4. Test code debugging ("what's wrong with this code?")
