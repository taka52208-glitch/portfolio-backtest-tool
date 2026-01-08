import { create } from 'zustand';
import type { PortfolioItem, BacktestResult } from '../types';

interface PortfolioState {
  portfolio: PortfolioItem[];
  period: '1y' | '3y' | '5y';
  backtestResult: BacktestResult | null;
  isLoading: boolean;
  error: string | null;

  // アクション
  addStock: (item: PortfolioItem) => void;
  removeStock: (code: string) => void;
  updateWeight: (code: string, weight: number) => void;
  setPeriod: (period: '1y' | '3y' | '5y') => void;
  setBacktestResult: (result: BacktestResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPortfolio: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: [],
  period: '3y',
  backtestResult: null,
  isLoading: false,
  error: null,

  addStock: (item) =>
    set((state) => {
      if (state.portfolio.some((p) => p.stock.code === item.stock.code)) {
        return state;
      }
      return { portfolio: [...state.portfolio, item] };
    }),

  removeStock: (code) =>
    set((state) => ({
      portfolio: state.portfolio.filter((p) => p.stock.code !== code),
    })),

  updateWeight: (code, weight) =>
    set((state) => ({
      portfolio: state.portfolio.map((p) =>
        p.stock.code === code ? { ...p, weight } : p
      ),
    })),

  setPeriod: (period) => set({ period }),

  setBacktestResult: (result) => set({ backtestResult: result }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearPortfolio: () => set({ portfolio: [], backtestResult: null, error: null }),
}));
