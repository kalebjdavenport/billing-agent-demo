// Agent message types for SSE streaming

export interface TextMessage {
  type: 'text';
  content: string;
}

export interface ToolUseMessage {
  type: 'tool_use';
  toolName: string;
  input?: Record<string, unknown>;
}

export interface ToolResultMessage {
  type: 'tool_result';
  toolName: string;
  result?: string;
}

export interface DoneMessage {
  type: 'done';
}

export type AgentMessage = TextMessage | ToolUseMessage | ToolResultMessage | DoneMessage;

// ============================================
// Validation/Test Runner Types
// ============================================

export interface ThinkingMessage {
  type: 'thinking';
  content: string;
}

export interface ProgressMessage {
  type: 'progress';
  toolName: string;
  elapsedMs: number;
}

export interface StepMessage {
  type: 'step';
  testIndex: number;
  stepIndex: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface TestStartMessage {
  type: 'test_start';
  testIndex: number;
}

export interface TestResultMessage {
  type: 'test_result';
  testIndex: number;
  passed: boolean;
  response: string;
  reason?: string;
}

export interface ErrorMessage {
  type: 'error';
  error: string;
  testIndex?: number;
}

export type ValidationMessage =
  | TextMessage
  | ToolUseMessage
  | ToolResultMessage
  | ThinkingMessage
  | ProgressMessage
  | StepMessage
  | TestStartMessage
  | TestResultMessage
  | ErrorMessage
  | DoneMessage;

// Test case definition
export interface TestCase {
  name: string;
  query: string;
  expectedContains: string[];
  expectedNotContains?: string[];
}

// Test run state for UI
export type TestStatus = 'pending' | 'running' | 'passed' | 'failed';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface TestStep {
  name: string;
  status: StepStatus;
}

export interface TestState {
  name: string;
  query: string;
  status: TestStatus;
  steps: TestStep[];
  thinking: string;
  response: string;
  toolCalls: {
    name: string;
    input?: Record<string, unknown>;
    result?: string;
    elapsedMs?: number;
  }[];
  failureReason?: string;
}

export interface ValidationState {
  tests: TestState[];
  currentTestIndex: number;
  isRunning: boolean;
  passedCount: number;
  failedCount: number;
}

// Request/Response types for the API
export interface AgentRequest {
  prompt: string;
}

// Chat message type for the UI
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: {
    name: string;
    input?: Record<string, unknown>;
    result?: string;
  }[];
  timestamp: Date;
}
