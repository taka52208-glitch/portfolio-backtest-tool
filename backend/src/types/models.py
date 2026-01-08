from pydantic import BaseModel, Field
from typing import Literal


class Stock(BaseModel):
    code: str
    name: str
    market: Literal["JP", "US"]


class PortfolioItem(BaseModel):
    stock: Stock
    weight: float = Field(ge=0, le=100)


class BacktestInput(BaseModel):
    portfolio: list[PortfolioItem]
    period: Literal["1y", "3y", "5y"]


class DailyValue(BaseModel):
    date: str
    value: float
    benchmark: float


class Metrics(BaseModel):
    cumulativeReturn: float
    annualizedReturn: float
    sharpeRatio: float
    maxDrawdown: float


class BenchmarkMetrics(BaseModel):
    cumulativeReturn: float
    annualizedReturn: float


class BacktestResult(BaseModel):
    dailyValues: list[DailyValue]
    metrics: Metrics
    benchmarkMetrics: BenchmarkMetrics
    portfolio: list[PortfolioItem]
    period: Literal["1y", "3y", "5y"]


class ApiResponse(BaseModel):
    success: bool
    data: dict | list | None = None
    error: str | None = None


class StockSearchResult(BaseModel):
    stocks: list[Stock]
