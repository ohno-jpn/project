# 株式会社ユウイング ホームページ管理

大野家の資産管理会社「株式会社ユウイング」のホームページ運用・会社書類・家族情報を一元管理するフォルダ。

## 会社概要

- **会社名**: 株式会社ユウイング
- **種別**: ファミリー資産管理会社
- **サイト**: https://yuuing.co.jp
- **CMS**: WordPress（Xserver レンタルサーバー）
- **テーマ**: Lightning + VK All in One Expansion Unit

## フォルダ構成

```
yuuing/
├── docs/
│   ├── company/
│   │   ├── 議事録/          ← 取締役会・株主総会の議事録
│   │   └── 定款・契約/      ← 定款、各種契約書の控え
│   └── family/              ← 家族間で共有する情報・連絡事項
├── wordpress/
│   ├── themes/              ← カスタムテーマのコード
│   ├── plugins/             ← カスタマイズしたプラグイン
│   └── backups/             ← バックアップ管理メモ（SQLファイル自体は.gitignore対象）
├── design/
│   └── assets/              ← ロゴ・バナー等のデザイン素材
└── ops/                     ← サーバー設定・運用手順（server-info.mdはGit管理外）
```

## 議事録の命名規則

```
docs/company/議事録/YYYY-MM-DD_取締役会.md
docs/company/議事録/YYYY-MM-DD_株主総会.md
```

## WordPress管理画面

- 管理画面: https://yuuing.co.jp/wp-admin
- サーバー接続情報: `ops/server-info.md`（Gitには**コミットしない**）
