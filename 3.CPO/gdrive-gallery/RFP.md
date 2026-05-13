# RFP: Google Drive 写真ギャラリーシステム

## 概要

Google Drive上の「YYYYMMDD_タイトル」フォルダ群を読み込み、イベント別に写真を一覧表示するWebアプリケーション。
既存の picture-inf システム（Python + Flask）に統合する。

---

## 要件一覧

### 1. Google Drive 連携

- 接続方式：Google Drive API v3（OAuth2認証）
- 対象：指定した **親フォルダ1つ** 配下の直下フォルダのみ（サブフォルダ不要）
- フォルダ名フォーマット：`YYYYMMDD_タイトル`（例：`20240101_初日の出`）
- 対応画像形式：JPG / PNG / HEIC / RAW 他（Drive APIのプレビュー提供範囲内）
- サムネイル：**Google Drive API の `thumbnailLink` をそのまま使用**（サーバー・DBへの画像保存なし）

> **将来拡張**：親フォルダを複数管理できるよう、設計は拡張性を持たせる

---

### 2. 認証

| 項目 | 内容 |
|------|------|
| 認証方式 | Clerk（OAuth / メール等） |
| アクセス制御 | ログイン済みユーザーのみ閲覧可能 |
| バックエンド検証 | Clerk発行のJWTをFlask側でミドルウェア検証 |

---

### 3. イベント一覧ページ（`/events`）

- Google Driveから取得した全イベントフォルダをカード形式で一覧表示
- 各カードの表示内容：
  - 日付（フォルダ名から抽出）
  - イベントタイトル（フォルダ名から抽出）
  - 代表サムネイル（フォルダ内の先頭1枚）
  - 写真枚数
- 並び順：日付降順（新しい順）をデフォルト
- **検索・絞り込み機能**：
  - キーワード（タイトル部分一致）
  - 日付範囲（From / To）

---

### 4. イベント詳細ページ（`/events/<folder_id>`）

- イベントごとに独立した1ページ
- フォルダ内の全写真をサムネイルグリッドで表示
- サムネイルクリックで **ライトボックス拡大表示**
- 表示内容：
  - イベントタイトル
  - 日付
  - 写真グリッド（Google Drive thumbnailLink 使用）

---

### 5. データベース設計（メタデータキャッシュ）

**方針：画像データは一切DBに保存しない。Drive APIコールを最小化するため、フォルダ・ファイルのメタデータのみキャッシュする。**

#### events（イベントキャッシュ）

| カラム | 型 | 説明 |
|--------|----|------|
| id | INTEGER PK | |
| folder_id | TEXT UNIQUE | Google DriveフォルダID |
| folder_name | TEXT | `YYYYMMDD_タイトル`（元のフォルダ名） |
| event_date | DATE | フォルダ名から抽出した日付 |
| event_title | TEXT | フォルダ名から抽出したタイトル |
| photo_count | INTEGER | 写真枚数 |
| cover_thumbnail_url | TEXT | 代表サムネイルURL（先頭1枚） |
| last_synced | DATETIME | 最終同期日時 |

#### photos（写真メタデータキャッシュ）

| カラム | 型 | 説明 |
|--------|----|------|
| id | INTEGER PK | |
| event_id | INTEGER FK | |
| file_id | TEXT UNIQUE | Google DriveファイルID |
| filename | TEXT | ファイル名 |
| thumbnail_url | TEXT | Drive thumbnailLink |
| web_view_url | TEXT | Drive webViewLink（拡大表示用） |
| mime_type | TEXT | 画像MIME type |
| sort_order | INTEGER | フォルダ内での表示順 |

#### sync_log（同期ログ）

| カラム | 型 | 説明 |
|--------|----|------|
| id | INTEGER PK | |
| synced_at | DATETIME | 同期実行日時 |
| event_count | INTEGER | 同期したイベント数 |
| photo_count | INTEGER | 同期した写真数 |
| status | TEXT | success / error |

---

### 6. 同期（Sync）機能

- 管理者用エンドポイント `POST /admin/sync` でGoogle Driveから最新情報を取得・DBを更新
- 同期内容：
  1. 親フォルダ配下のフォルダ一覧を取得 → `events` テーブルに反映
  2. 各フォルダ内のファイル一覧を取得 → `photos` テーブルに反映
  3. `sync_log` にログ記録
- 同期タイミング：手動実行 or 定期バッチ（cron）

---

### 7. 技術スタック

| 領域 | 技術 |
|------|------|
| Backend | Python + Flask（既存 picture-inf に統合） |
| 認証 | Clerk（JWT検証ミドルウェア on Flask） |
| Database | SQLite + SQLAlchemy（メタデータキャッシュのみ） |
| Google Drive | google-api-python-client（v3） |
| フロントエンド | Jinja2 + Bootstrap 5 + Vanilla JS |
| 画像表示 | Google Drive thumbnailLink + Lightbox（例：GLightbox / lightbox2） |

---

### 8. 画面一覧

| 画面 | URL | 説明 |
|------|-----|------|
| ログイン | `/login` | Clerk認証画面 |
| イベント一覧 | `/events` | 全イベントのカード一覧・検索フィルタ |
| イベント詳細 | `/events/<folder_id>` | 写真サムネイルグリッド＋ライトボックス |
| 管理：同期実行 | `/admin/sync` | DriveからDBへの手動同期 |

---

### 9. 考慮事項・制約

| 項目 | 内容 |
|------|------|
| Google Drive thumbnailLink | 認証トークンが必要な場合あり。公開設定によってURLが変わる |
| HEIC / RAW | DriveのサムネイルはJPG変換プレビューを使用。非対応形式は代替アイコン表示 |
| APIクォータ | Google Drive APIは1日あたりのリクエスト上限あり。キャッシュで抑制 |
| Clerkのplan | 無料プランで小規模利用は対応可能 |

---

### 10. 将来拡張（Phase 2以降）

- 複数の親フォルダ管理（ユーザーごとにDriveフォルダを紐付け）
- EXIF情報表示・地図連携（既存 picture-inf 機能との統合）
- 写真へのコメント・タグ機能
- シェア機能（特定ユーザーへのアクセス権付与）
