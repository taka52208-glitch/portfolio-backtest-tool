import axios from 'axios';
import type { Stock, BacktestInput, BacktestResult, ApiResponse, StockSearchResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8463';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 銘柄検索
export const searchStocks = async (query: string): Promise<Stock[]> => {
  const response = await api.get<ApiResponse<StockSearchResult>>('/api/stocks/search', {
    params: { q: query },
  });
  if (response.data.success && response.data.data) {
    return response.data.data.stocks;
  }
  throw new Error(response.data.error || '銘柄検索に失敗しました');
};

// バックテスト実行
export const runBacktest = async (input: BacktestInput): Promise<BacktestResult> => {
  const response = await api.post<ApiResponse<BacktestResult>>('/api/backtest', input);
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || 'バックテストに失敗しました');
};

// ヘルスチェック
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await api.get('/api/health');
    return response.status === 200;
  } catch {
    return false;
  }
};
