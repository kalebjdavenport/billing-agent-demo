import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Chat } from './Chat';

// Mock the useAgentStream hook
const mockSendMessage = vi.fn();
const mockClearMessages = vi.fn();

vi.mock('@/hooks/useAgentStream', () => ({
  useAgentStream: vi.fn(() => ({
    messages: [],
    isStreaming: false,
    error: null,
    sendMessage: mockSendMessage,
    clearMessages: mockClearMessages,
  })),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Get the mocked module for manipulation
import { useAgentStream } from '@/hooks/useAgentStream';
const mockedUseAgentStream = vi.mocked(useAgentStream);

describe('Chat', () => {
  beforeEach(() => {
    mockSendMessage.mockClear();
    mockClearMessages.mockClear();
    mockedUseAgentStream.mockReturnValue({
      messages: [],
      isStreaming: false,
      error: null,
      sendMessage: mockSendMessage,
      clearMessages: mockClearMessages,
    });
  });

  it('renders header with title', () => {
    render(<Chat />);

    expect(screen.getByText('Billing Agent')).toBeInTheDocument();
  });

  it('renders Validate link', () => {
    render(<Chat />);

    const validateLink = screen.getByRole('link', { name: /validate/i });
    expect(validateLink).toBeInTheDocument();
    expect(validateLink).toHaveAttribute('href', '/validate');
  });

  it('renders ChatInput component', () => {
    render(<Chat />);

    expect(screen.getByPlaceholderText('Ask about your billing data...')).toBeInTheDocument();
  });

  it('hides New button when no messages', () => {
    render(<Chat />);

    expect(screen.queryByText('New')).not.toBeInTheDocument();
  });

  it('shows New button when messages exist', () => {
    mockedUseAgentStream.mockReturnValue({
      messages: [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
      ],
      isStreaming: false,
      error: null,
      sendMessage: mockSendMessage,
      clearMessages: mockClearMessages,
    });

    render(<Chat />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('calls clearMessages when New button clicked', () => {
    mockedUseAgentStream.mockReturnValue({
      messages: [
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
      ],
      isStreaming: false,
      error: null,
      sendMessage: mockSendMessage,
      clearMessages: mockClearMessages,
    });

    render(<Chat />);

    fireEvent.click(screen.getByText('New'));

    expect(mockClearMessages).toHaveBeenCalled();
  });

  it('shows error banner when error exists', () => {
    mockedUseAgentStream.mockReturnValue({
      messages: [],
      isStreaming: false,
      error: 'Something went wrong',
      sendMessage: mockSendMessage,
      clearMessages: mockClearMessages,
    });

    render(<Chat />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('hides error banner when no error', () => {
    render(<Chat />);

    // Error banner should not be present
    const errorText = screen.queryByText(/error/i);
    expect(errorText).not.toBeInTheDocument();
  });

  it('disables input when streaming', () => {
    mockedUseAgentStream.mockReturnValue({
      messages: [],
      isStreaming: true,
      error: null,
      sendMessage: mockSendMessage,
      clearMessages: mockClearMessages,
    });

    render(<Chat />);

    expect(screen.getByPlaceholderText('Ask about your billing data...')).toBeDisabled();
  });
});
