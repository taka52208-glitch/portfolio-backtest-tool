import os
import signal
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """アプリケーションのライフサイクル管理"""
    # 起動時
    print("Starting Portfolio Backtest API...")
    yield
    # シャットダウン時
    print("Shutting down Portfolio Backtest API...")


app = FastAPI(
    title="Portfolio Backtest API",
    description="投資ポートフォリオのバックテストツール API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS設定（環境変数から取得、カンマ区切りで複数指定可能）
cors_origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3847,http://127.0.0.1:3847")
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(router)


# グレースフルシャットダウン
def handle_sigterm(signum, frame):
    print("Received SIGTERM, shutting down gracefully...")
    sys.exit(0)


signal.signal(signal.SIGTERM, handle_sigterm)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8463)
