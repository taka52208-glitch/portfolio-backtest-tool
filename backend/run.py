#!/usr/bin/env python3
"""開発サーバー起動スクリプト"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8463,
        reload=True,
    )
