// 銘柄情報
export interface Stock {
  code: string;
  name: string;
  market: 'JP' | 'US';
}

// ポートフォリオ内の銘柄
export interface PortfolioItem {
  stock: Stock;
  weight: number; // 投資比率（0-100）
}

// バックテスト入力
export interface BacktestInput {
  portfolio: PortfolioItem[];
  period: '1y' | '3y' | '5y';
}

// 日次のポートフォリオ価値
export interface DailyValue {
  date: string;
  value: number;
  benchmark: number;
}

// バックテスト結果
export interface BacktestResult {
  dailyValues: DailyValue[];
  metrics: {
    cumulativeReturn: number;      // 累積リターン（%）
    annualizedReturn: number;      // 年率リターン（%）
    sharpeRatio: number;           // シャープレシオ
    maxDrawdown: number;           // 最大ドローダウン（%）
  };
  benchmarkMetrics: {
    cumulativeReturn: number;
    annualizedReturn: number;
  };
  portfolio: PortfolioItem[];
  period: '1y' | '3y' | '5y';
}

// API レスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 銘柄検索結果
export interface StockSearchResult {
  stocks: Stock[];
}
