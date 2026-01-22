'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
}

const STORAGE_KEY = 'billing-agent-search-history';
const MAX_HISTORY_ITEMS = 20;

/**
 * Hook for managing search history with localStorage persistence.
 */
export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load search history:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      } catch (e) {
        console.error('Failed to save search history:', e);
      }
    }
  }, [history, isLoaded]);

  const addToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item.query !== trimmed);

      // Add new item at the beginning
      const newItem: SearchHistoryItem = {
        id: `history-${Date.now()}`,
        query: trimmed,
        timestamp: Date.now(),
      };

      // Keep only the most recent items
      return [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    isLoaded,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
