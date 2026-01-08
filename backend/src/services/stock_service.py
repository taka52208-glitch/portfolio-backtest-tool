import yfinance as yf
from ..types.models import Stock


# サンプル銘柄データ（検索用）
SAMPLE_STOCKS: list[Stock] = [
    Stock(code="7203.T", name="トヨタ自動車", market="JP"),
    Stock(code="6758.T", name="ソニーグループ", market="JP"),
    Stock(code="9984.T", name="ソフトバンクグループ", market="JP"),
    Stock(code="6861.T", name="キーエンス", market="JP"),
    Stock(code="9432.T", name="日本電信電話", market="JP"),
    Stock(code="6501.T", name="日立製作所", market="JP"),
    Stock(code="8306.T", name="三菱UFJフィナンシャル・グループ", market="JP"),
    Stock(code="6902.T", name="デンソー", market="JP"),
    Stock(code="7267.T", name="ホンダ", market="JP"),
    Stock(code="9433.T", name="KDDI", market="JP"),
    Stock(code="AAPL", name="Apple Inc.", market="US"),
    Stock(code="GOOGL", name="Alphabet Inc.", market="US"),
    Stock(code="MSFT", name="Microsoft Corp.", market="US"),
    Stock(code="AMZN", name="Amazon.com Inc.", market="US"),
    Stock(code="NVDA", name="NVIDIA Corp.", market="US"),
    Stock(code="META", name="Meta Platforms Inc.", market="US"),
    Stock(code="TSLA", name="Tesla Inc.", market="US"),
    Stock(code="JPM", name="JPMorgan Chase & Co.", market="US"),
    Stock(code="V", name="Visa Inc.", market="US"),
    Stock(code="JNJ", name="Johnson & Johnson", market="US"),
]


def search_stocks(query: str) -> list[Stock]:
    """銘柄を検索する"""
    if not query:
        return SAMPLE_STOCKS[:10]

    query_lower = query.lower()
    results = [
        stock
        for stock in SAMPLE_STOCKS
        if query_lower in stock.code.lower() or query_lower in stock.name.lower()
    ]

    return results[:10]


def validate_stock_code(code: str) -> bool:
    """銘柄コードが有効かどうかを確認する"""
    try:
        ticker = yf.Ticker(code)
        info = ticker.info
        return info is not None and "symbol" in info
    except Exception:
        return False
