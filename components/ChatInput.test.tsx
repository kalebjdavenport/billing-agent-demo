import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('rendering', () => {
    it('renders textarea and submit button', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
    });

    it('displays custom placeholder', () => {
      render(<ChatInput onSubmit={mockOnSubmit} placeholder="Ask a question..." />);

      expect(screen.getByPlaceholderText('Ask a question...')).toBeInTheDocument();
    });

    it('displays default placeholder', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />);

      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    it('renders keyboard hint text', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />);

      expect(screen.getByText('send')).toBeInTheDocument();
      expect(screen.getByText('new line')).toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('calls onSubmit with trimmed input when form is submitted', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '  Hello world  ');
      await user.click(screen.getByRole('button'));

      expect(mockOnSubmit).toHaveBeenCalledWith('Hello world');
    });

    it('does not submit empty messages', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole('button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not submit whitespace-only messages', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '   ');
      await user.click(screen.getByRole('button'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('clears input after successful submission', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      await user.click(screen.getByRole('button'));

      expect(textarea).toHaveValue('');
    });
  });

  describe('keyboard shortcuts', () => {
    it('submits on Enter key', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledWith('Hello');
    });

    it('adds newline on Shift+Enter', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      await user.type(textarea, 'Line 2');

      expect(mockOnSubmit).not.toHaveBeenCalled();
      expect(textarea).toHaveValue('Line 1\nLine 2');
    });

    it('does not submit on Enter when input is empty', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('{Enter}');

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<ChatInput onSubmit={mockOnSubmit} disabled={true} />);

      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disables submit button when disabled prop is true', () => {
      render(<ChatInput onSubmit={mockOnSubmit} disabled={true} />);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('prevents submission when disabled', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} disabled={true} />);

      const textarea = screen.getByRole('textbox');
      // Even though disabled, we can set value programmatically
      fireEvent.change(textarea, { target: { value: 'Hello' } });

      // Keyboard events are blocked on disabled elements by userEvent
      // so we need to use fireEvent
      fireEvent.keyDown(textarea, { key: 'Enter' });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows loading spinner when disabled', () => {
      render(<ChatInput onSubmit={mockOnSubmit} disabled={true} />);

      // The spinner has the animate-spin class
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('button state', () => {
    it('disables button when input is empty', () => {
      render(<ChatInput onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('enables button when input has content', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Hello');

      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('disables button when input only has whitespace', async () => {
      const user = userEvent.setup();
      render(<ChatInput onSubmit={mockOnSubmit} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '   ');

      expect(screen.getByRole('button')).toBeDisabled();
    });
  });
});
