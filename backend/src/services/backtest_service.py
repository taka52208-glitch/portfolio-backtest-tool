from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import yfinance as yf
from ..types.models import (
    BacktestInput,
    BacktestResult,
    DailyValue,
    Metrics,
    BenchmarkMetrics,
    PortfolioItem,
)


def get_period_start_date(period: str) -> datetime:
    """期間から開始日を計算する"""
    today = datetime.now()
    if period == "1y":
        return today - timedelta(days=365)
    elif period == "3y":
        return today - timedelta(days=365 * 3)
    else:  # 5y
        return today - timedelta(days=365 * 5)


def fetch_stock_data(codes: list[str], start_date: datetime, end_date: datetime) -> pd.DataFrame:
    """複数銘柄の株価データを取得する"""
    if len(codes) == 1:
        data = yf.download(codes[0], start=start_date, end=end_date, progress=False)
        if not data.empty:
            data = data[["Close"]].rename(columns={"Close": codes[0]})
    else:
        data = yf.download(codes, start=start_date, end=end_date, progress=False)
        if not data.empty:
            data = data["Close"]

    return data


def calculate_portfolio_value(prices: pd.DataFrame, weights: dict[str, float], initial_value: float = 1000000) -> pd.Series:
    """ポートフォリオの価値を計算する"""
    # 欠損値を前方補完
    prices = prices.ffill().bfill()

    # 各銘柄のリターンを計算
    returns = prices.pct_change().fillna(0)

    # ポートフォリオのリターンを計算
    portfolio_returns = pd.Series(0, index=returns.index)
    for code, weight in weights.items():
        if code in returns.columns:
            portfolio_returns += returns[code] * (weight / 100)

    # 累積価値を計算
    cumulative_returns = (1 + portfolio_returns).cumprod()
    portfolio_value = initial_value * cumulative_returns

    return portfolio_value


def calculate_metrics(portfolio_value: pd.Series, risk_free_rate: float = 0.001) -> Metrics:
    """投資指標を計算する"""
    # 日次リターン
    daily_returns = portfolio_value.pct_change().dropna()

    # 累積リターン
    cumulative_return = (portfolio_value.iloc[-1] / portfolio_value.iloc[0] - 1) * 100

    # 年率リターン
    days = len(portfolio_value)
    annualized_return = ((portfolio_value.iloc[-1] / portfolio_value.iloc[0]) ** (252 / days) - 1) * 100

    # シャープレシオ
    excess_returns = daily_returns - risk_free_rate / 252
    if excess_returns.std() > 0:
        sharpe_ratio = np.sqrt(252) * excess_returns.mean() / excess_returns.std()
    else:
        sharpe_ratio = 0

    # 最大ドローダウン
    cummax = portfolio_value.cummax()
    drawdown = (portfolio_value - cummax) / cummax
    max_drawdown = drawdown.min() * 100

    return Metrics(
        cumulativeReturn=round(cumulative_return, 2),
        annualizedReturn=round(annualized_return, 2),
        sharpeRatio=round(sharpe_ratio, 2),
        maxDrawdown=round(max_drawdown, 2),
    )


def get_benchmark_code(portfolio: list[PortfolioItem]) -> str:
    """ポートフォリオに基づいてベンチマークを選択する"""
    jp_count = sum(1 for item in portfolio if item.stock.market == "JP")
    us_count = sum(1 for item in portfolio if item.stock.market == "US")

    if jp_count >= us_count:
        return "^N225"  # 日経225
    else:
        return "^GSPC"  # S&P500


def run_backtest(input_data: BacktestInput) -> BacktestResult:
    """バックテストを実行する"""
    # 期間の設定
    start_date = get_period_start_date(input_data.period)
    end_date = datetime.now()

    # 銘柄コードと比率の取得
    codes = [item.stock.code for item in input_data.portfolio]
    weights = {item.stock.code: item.weight for item in input_data.portfolio}

    # 株価データの取得
    prices = fetch_stock_data(codes, start_date, end_date)

    if prices.empty:
        raise ValueError("株価データを取得できませんでした")

    # ポートフォリオ価値の計算
    portfolio_value = calculate_portfolio_value(prices, weights)

    # ベンチマークの取得と計算
    benchmark_code = get_benchmark_code(input_data.portfolio)
    benchmark_data = yf.download(benchmark_code, start=start_date, end=end_date, progress=False)

    if not benchmark_data.empty:
        benchmark_prices = benchmark_data["Close"]
        benchmark_value = 1000000 * (benchmark_prices / benchmark_prices.iloc[0])
    else:
        benchmark_value = pd.Series(1000000, index=portfolio_value.index)

    # 日次データの作成
    daily_values = []
    for date in portfolio_value.index:
        date_str = date.strftime("%Y-%m-%d")
        pf_val = float(portfolio_value.loc[date])
        bm_val = float(benchmark_value.loc[date]) if date in benchmark_value.index else pf_val
        daily_values.append(DailyValue(date=date_str, value=round(pf_val, 0), benchmark=round(bm_val, 0)))

    # 指標の計算
    metrics = calculate_metrics(portfolio_value)

    # ベンチマーク指標
    if not benchmark_data.empty:
        benchmark_cumulative = (benchmark_value.iloc[-1] / benchmark_value.iloc[0] - 1) * 100
        days = len(benchmark_value)
        benchmark_annualized = ((benchmark_value.iloc[-1] / benchmark_value.iloc[0]) ** (252 / days) - 1) * 100
    else:
        benchmark_cumulative = 0
        benchmark_annualized = 0

    benchmark_metrics = BenchmarkMetrics(
        cumulativeReturn=round(benchmark_cumulative, 2),
        annualizedReturn=round(benchmark_annualized, 2),
    )

    return BacktestResult(
        dailyValues=daily_values,
        metrics=metrics,
        benchmarkMetrics=benchmark_metrics,
        portfolio=input_data.portfolio,
        period=input_data.period,
    )
