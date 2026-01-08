# プロジェクト設定

## 基本設定
```yaml
プロジェクト名: 投資ポートフォリオ・バックテストツール
開始日: 2026-01-08
技術スタック:
  frontend: React 18 + TypeScript 5 + MUI v6 + ApexCharts
  backend: Python 3.12 + FastAPI
  database: なし（MVP版）
```

## 開発環境
```yaml
ポート設定:
  frontend: 3847
  backend: 8463

環境変数:
  設定ファイル: .env.local（ルートディレクトリ）
  必須項目:
    - VITE_API_URL（バックエンドAPIのURL）
```

## テスト認証情報
```yaml
開発用アカウント:
  なし（MVP版は認証不要）

外部サービス:
  yfinance: APIキー不要
```

## コーディング規約

### 命名規則
```yaml
ファイル名:
  - コンポーネント: PascalCase.tsx (例: PortfolioInput.tsx)
  - ユーティリティ: camelCase.ts (例: calculateReturns.ts)
  - 定数: UPPER_SNAKE_CASE.ts (例: API_ENDPOINTS.ts)

変数・関数:
  - 変数: camelCase
  - 関数: camelCase
  - 定数: UPPER_SNAKE_CASE
  - 型/インターフェース: PascalCase
```

### コード品質
```yaml
必須ルール:
  - TypeScript: strictモード有効
  - 未使用の変数/import禁止
  - console.log本番環境禁止
  - エラーハンドリング必須
  - 関数行数: 100行以下
  - ファイル行数: 700行以下
  - 複雑度(McCabe): 10以下
  - 行長: 120文字

フォーマット:
  - インデント: スペース2つ
  - セミコロン: あり
  - クォート: シングル
```

## プロジェクト固有ルール

### APIエンドポイント
```yaml
命名規則:
  - RESTful形式を厳守
  - 複数形を使用 (/stocks, /portfolios)
  - ケバブケース使用 (/api/backtest)
```

### 型定義
```yaml
配置:
  frontend: src/types/index.ts
  backend: src/types/index.ts

同期ルール:
  - 両ファイルは常に同一内容を保つ
  - 片方を更新したら即座にもう片方も更新
```

## 最新技術情報（知識カットオフ対応）
```yaml
# yfinanceの注意点
yfinance:
  - 最新版では curl_cffi が必要な場合あり
  - レート制限: 1分100リクエスト推奨
  - 日本株は銘柄コードに ".T" を付与（例: 7203.T）

# ApexChartsの注意点
apexcharts:
  - react-apexcharts と apexcharts 両方のインストールが必要
  - TypeScript型定義は @types/apexcharts ではなく apexcharts に内包
```

## ディレクトリ構成（予定）
```
/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── services/
│   │   └── types/
│   └── requirements.txt
├── docs/
│   ├── requirements.md
│   └── SCOPE_PROGRESS.md
└── CLAUDE.md
```
