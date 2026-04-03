# RunningCoach

GARMINデータと練習テーマのPDCAにより、マラソンPB更新を支援するWebアプリです。

## コンセプト

```
目標大会・目標タイムを起点に、
「テーマ設定 → 実走 → データ取得 → 評価 → 次の練習提案」
のPDCAを毎日回し続けることで、マラソンPB更新をサポートする。
```

## 画面構成

| パス | 内容 |
|------|------|
| `/` | ダッシュボード（目標・直近の練習・最新提案） |
| `/goal` | 目標大会・タイム設定・週次練習計画 |
| `/log/new` | 練習記録（テーマ設定・CSVアップロード・自己評価） |
| `/log/[date]` | 特定日の練習詳細・AI評価結果 |
| `/history` | 練習履歴一覧・グラフ |
| `/advice` | 翌日練習メニュー提案 |

## 主な機能

- **目標管理**：目標大会・タイムから目安ペースを自動計算・残り日数表示
- **GARMINデータ取込**：CSVアップロードで全フィールドを解析
- **テーマ評価**：練習前テーマ（ペース・心拍・フォーム等）をデータで自動評価
- **AI練習提案**：累積疲労・目標・テーマ達成度をすべて考慮した翌日メニュー提案
- **フィードバックループ**：提案への評価が次の提案に反映

## 技術スタック

- **フレームワーク**：Next.js 16（App Router）
- **言語**：TypeScript
- **スタイリング**：Tailwind CSS v4
- **UIコンポーネント**：shadcn/ui
- **グラフ**：Recharts（実装予定）
- **AI連携**：Claude API / OpenAI API（要選定）
- **データ保存**：localStorage（フェーズ1）→ Supabase（フェーズ2）
- **認証**：Clerk（フェーズ2以降）
- **デプロイ**：Vercel

## ディレクトリ構成

```
RunningCoach/
├── app/
│   ├── page.tsx              # ダッシュボード
│   ├── goal/page.tsx         # 目標・計画設定
│   ├── log/
│   │   ├── new/page.tsx      # 練習記録入力
│   │   └── [date]/page.tsx   # 練習詳細・AI評価
│   ├── history/page.tsx      # 練習履歴
│   └── advice/page.tsx       # 練習提案
├── lib/
│   ├── types.ts              # 全型定義
│   ├── garmin.ts             # GARMINデータ解析・ペース計算
│   ├── storage.ts            # localStorageデータ管理
│   └── utils.ts              # shadcn/uiユーティリティ
├── components/ui/            # shadcn/uiコンポーネント
└── docs/
    └── RFP.md                # 要件定義書
```

## ローカル開発

```bash
npm install
npm run dev
# → localhost:3000
```

## フェーズ計画

| フェーズ | 内容 |
|---------|------|
| **フェーズ1（現在）** | 個人利用・CSVアップロード・localStorage保存 |
| フェーズ2 | Garmin Connect API連携・複数ユーザー・Supabase |
| フェーズ3 | 一般公開・SaaS・コーチングモード |

## 参考ドキュメント

- [RFP（要件定義書）](docs/RFP.md)

## ライセンス

© 2026 vast fields inc. All rights reserved.
