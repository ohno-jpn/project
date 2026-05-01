# AX-Diagnosis

組織のAIトランスフォーメーション（AX）準備状況を診断するWebアプリです。

## 概要

「OH 組織Hard」「OS 組織Soft」「PH 個人Hard」「PS 個人Soft」の4軸でスコアリングし、自社・自身のAX成熟度を可視化します。診断結果に基づき、優先的に取り組むべき改善アクションを提示します。

## 診断の深度（Depth）

| 深度 | 名称 | 問数 | 形式 | 内容 |
|------|------|------|------|------|
| Depth 1 | Hook | 4問 | 状態選択 / クイズ | 各軸1問で現状を素早く把握 |
| Depth 2 | Checkup | 16問 | 状態選択 / クイズ | 各軸4問でサブ領域を診断 |
| Depth 3 | Biopsy | 64問 | リッカート5段階 / クイズ | 各軸16問で詳細診断 |
| Depth 4 | Lab | 16問 | リッカート5段階 / クイズ | Checkup各項目の追加検証問題 |

## 4軸フレームワーク

横軸：組織（左）/ 個人（右）、縦軸：Hard（上）/ Soft（下）の4象限構造です。

```
              組織                      個人
         ┌──────────────────────┬──────────────────────┐
  Hard   │ OH 組織Hard           │ PH 個人Hard           │
  （上）  │ 戦略・KGI・ガバナンス │ テクニカルスキル      │
         │ データ基盤・プロセス  │ AI知識・リスク管理    │
         ├──────────────────────┼──────────────────────┤
  Soft   │ OS 組織Soft           │ PS 個人Soft           │
  （下）  │ 挑戦文化・機敏性      │ 課題設定力・目的志向  │
         │ HR評価・ナレッジ共有  │ 批判的思考・開放性    │
         └──────────────────────┴──────────────────────┘
```

## 成熟度レベル（Level 1〜5）

Level 5が最上位。スコアに応じて5段階で評価します。

| スコア | レベル | 説明 |
|--------|--------|------|
| 80〜100 | Level 5 先進 | AX推進の先進企業・個人 |
| 60〜79 | Level 4 発展 | 基盤が整い、活用が広がっている段階 |
| 40〜59 | Level 3 整備中 | 一部で取り組みが始まっている段階 |
| 20〜39 | Level 2 取組中 | 基礎的な取り組みを始めている段階 |
| 0〜19 | Level 1 初期 | これからAXに取り組む段階 |

## 画面構成

| パス | 内容 |
|------|------|
| `/` | LP（ヒーロー・ペイン・ソリューション・料金表） |
| `/diagnosis` | 診断画面（Depth選択 → 質問 → 回答） |
| `/diagnosis/result` | 結果画面（総合スコア・ヒートマップ・領域別リング・アドバイス） |
| `/level-definitions/hook` | Hook レベル定義一覧（H-01〜H-04、Level 5→1） |
| `/level-definitions/checkup` | Checkup レベル定義一覧（C-01〜C-16、軸別グループ、Level 5→1） |
| `/questions/hook/oh` | OH設問一覧（Depth 1〜4: Hook / Checkup / Biopsy / Lab） |
| `/questions/hook/os` | OS設問一覧（Depth 1〜4: Hook / Checkup / Biopsy / Lab） |
| `/questions/hook/ph` | PH設問一覧（Depth 1〜4: Hook / Checkup / Biopsy / Lab） |
| `/questions/hook/ps` | PS設問一覧（Depth 1〜4: Hook / Checkup / Biopsy / Lab） |
| `/questions/checkup` | Checkup設問一覧（全16問・軸別グループ） |

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router, Turbopack)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: shadcn/ui、@base-ui/react
- **アイコン**: lucide-react
- **認証**: Clerk（@clerk/nextjs インストール済み・実装予定）
- **データベース**: Supabase（@supabase/supabase-js インストール済み・実装予定）

## ディレクトリ構成

```
ax-diagnosis/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                          # ランディングページ（LP）
│   ├── diagnosis/
│   │   ├── page.tsx                      # 診断画面
│   │   └── result/page.tsx               # 診断結果ページ
│   ├── level-definitions/
│   │   ├── hook/page.tsx                 # Hook レベル定義
│   │   └── checkup/page.tsx              # Checkup レベル定義
│   └── questions/
│       ├── checkup/page.tsx              # Checkup 設問一覧（全16問）
│       └── hook/
│           ├── oh/page.tsx               # OH 設問一覧（Depth 1〜4）
│           ├── os/page.tsx               # OS 設問一覧（Depth 1〜4）
│           ├── ph/page.tsx               # PH 設問一覧（Depth 1〜4）
│           └── ps/page.tsx               # PS 設問一覧（Depth 1〜4）
├── lib/
│   ├── question-reference-data.ts        # 全設問データ（Hook/Checkup/Biopsy/Lab）
│   ├── questions.ts                      # 診断データ・スコアリングロジック
│   └── utils.ts
└── components/
    └── ui/                               # shadcn/ui コンポーネント
```

## 設問データ構造（`lib/question-reference-data.ts`）

各軸ごとに以下をエクスポートしています。

| エクスポート | 型 | 内容 |
|-------------|-----|------|
| `OH_HOOK` / `OS_HOOK` / `PH_HOOK` / `PS_HOOK` | `QuestionEntry` | 各軸のHook問（1問） |
| `OH_CHECKUP` / ... | `QuestionEntry[]` | 各軸のCheckup問（4問） |
| `OH_BIOPSY` / ... | `{ area: string; questions: QuestionEntry[] }[]` | 各軸のBiopsy問（16問・エリア別） |
| `OH_LAB` / ... | `{ area: string; questions: QuestionEntry[] }[]` | 各軸のLab問（4問・Checkup項目対応） |

設問フォーマット: `"state"` 状態選択 / `"quiz-single"` クイズ単一 / `"quiz-multi"` クイズ複数 / `"likert"` リッカート

## ローカル開発

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（localhost:3000）
npm run dev

# 同一ネットワーク内の他端末からアクセスする場合
npx next dev -H 0.0.0.0
```

## Vercelへのデプロイ

1. [vercel.com](https://vercel.com) にGitHubアカウントでログイン
2. 「Add New → Project」からリポジトリをImport
3. Root Directoryに `3.CPO/ax-diagnosis` を指定
4. 「Deploy」ボタンを押す

## ライセンス

© 2026 vast fields inc. All rights reserved.
