import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MessageList } from './MessageList';
import { ChatMessage } from '@/lib/agent/types';

describe('MessageList', () => {
  describe('empty state', () => {
    it('shows welcome message when no messages', () => {
      render(<MessageList messages={[]} />);

      expect(screen.getByText('What would you like to know?')).toBeInTheDocument();
    });

    it('shows description text', () => {
      render(<MessageList messages={[]} />);

      expect(screen.getByText('Ask about transactions, costs, or billing summaries')).toBeInTheDocument();
    });

    it('displays example prompts', () => {
      render(<MessageList messages={[]} />);

      expect(screen.getByText('Total spend last month?')).toBeInTheDocument();
      expect(screen.getByText('Show EC2 costs')).toBeInTheDocument();
      expect(screen.getByText('Any pending charges?')).toBeInTheDocument();
    });

    it('calls onSendMessage when example prompt clicked', () => {
      const mockOnSendMessage = vi.fn();
      render(<MessageList messages={[]} onSendMessage={mockOnSendMessage} />);

      fireEvent.click(screen.getByText('Total spend last month?'));

      expect(mockOnSendMessage).toHaveBeenCalledWith('Total spend last month?');
    });
  });

  describe('message rendering', () => {
    it('renders user messages', () => {
      const messages: ChatMessage[] = [
        { id: '1', role: 'user', content: 'Hello there', timestamp: new Date() },
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByText('Hello there')).toBeInTheDocument();
    });

    it('renders assistant messages', () => {
      const messages: ChatMessage[] = [
        { id: '1', role: 'assistant', content: 'Hi, how can I help?', timestamp: new Date() },
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByText('Hi, how can I help?')).toBeInTheDocument();
    });

    it('renders multiple messages in order', () => {
      const messages: ChatMessage[] = [
        { id: '1', role: 'user', content: 'First message', timestamp: new Date() },
        { id: '2', role: 'assistant', content: 'Second message', timestamp: new Date() },
        { id: '3', role: 'user', content: 'Third message', timestamp: new Date() },
      ];

      render(<MessageList messages={messages} />);

      const texts = screen.getAllByText(/message/i);
      expect(texts).toHaveLength(3);
    });
  });

  describe('streaming indicator', () => {
    it('shows typing indicator when streaming and assistant has no content', () => {
      const messages: ChatMessage[] = [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
        { id: '2', role: 'assistant', content: '', timestamp: new Date() },
      ];

      render(<MessageList messages={messages} isStreaming={true} />);

      // The typing indicator uses dots with typing-dot class
      const typingDots = document.querySelectorAll('.typing-dot');
      expect(typingDots.length).toBe(3);
    });
  });

  describe('tool calls', () => {
    it('displays tool calls when present', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          role: 'assistant',
          content: '',
          toolCalls: [
            { name: 'get_transactions', input: { limit: 10 } },
          ],
          timestamp: new Date(),
        },
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByText('get transactions')).toBeInTheDocument();
    });

    it('shows running status for pending tools', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          role: 'assistant',
          content: '',
          toolCalls: [
            { name: 'get_transactions', input: {} },
          ],
          timestamp: new Date(),
        },
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByText('running')).toBeInTheDocument();
    });

    it('shows done status for completed tools', () => {
      const messages: ChatMessage[] = [
        {
          id: '1',
          role: 'assistant',
          content: '',
          toolCalls: [
            { name: 'get_transactions', input: {}, result: 'Found 5 transactions' },
          ],
          timestamp: new Date(),
        },
      ];

      render(<MessageList messages={messages} />);

      expect(screen.getByText('✓ done')).toBeInTheDocument();
    });
  });
});
