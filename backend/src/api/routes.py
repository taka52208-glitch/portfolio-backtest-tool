from fastapi import APIRouter, HTTPException, Query
from ..types.models import BacktestInput, ApiResponse, StockSearchResult
from ..services.stock_service import search_stocks
from ..services.backtest_service import run_backtest

router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    """ヘルスチェックエンドポイント"""
    return {"status": "healthy"}


@router.get("/stocks/search")
async def search_stocks_endpoint(q: str = Query(default="", description="検索クエリ")):
    """銘柄検索エンドポイント"""
    try:
        stocks = search_stocks(q)
        return ApiResponse(
            success=True,
            data=StockSearchResult(stocks=stocks).model_dump(),
        )
    except Exception as e:
        return ApiResponse(success=False, error=str(e))


@router.post("/backtest")
async def run_backtest_endpoint(input_data: BacktestInput):
    """バックテスト実行エンドポイント"""
    try:
        # バリデーション
        if len(input_data.portfolio) == 0:
            raise HTTPException(status_code=400, detail="ポートフォリオに銘柄を追加してください")

        total_weight = sum(item.weight for item in input_data.portfolio)
        if abs(total_weight - 100) > 0.01:
            raise HTTPException(status_code=400, detail="投資比率の合計を100%にしてください")

        # バックテスト実行
        result = run_backtest(input_data)

        return ApiResponse(success=True, data=result.model_dump())
    except HTTPException:
        raise
    except Exception as e:
        return ApiResponse(success=False, error=str(e))
