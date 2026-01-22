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
