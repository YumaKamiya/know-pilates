# know-pilates ピラティススタジオ予約システム

50-60代女性向けピラティススタジオの予約・会員管理SaaSシステム

## 概要

know-pilatesは、以下の機能を提供する本格的な予約管理システムです：

- 🗓️ **会員予約システム**: 月プラン/回数券対応
- 👥 **会員管理**: プロフィール、チケット残高、予約履歴
- 🎫 **チケット管理**: 有効期限付き回数券、月プラン
- 📊 **管理ダッシュボード**: KPI表示、会員・プラン・スロット管理
- 📧 **招待システム**: トークンベースの会員招待
- 🔗 **Google連携**: Calendar、Sheets、Gmail API

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **バックエンド**: Supabase (PostgreSQL + Auth)
- **外部API**: Google Calendar, Sheets, Gmail
- **言語**: TypeScript 5
- **デプロイ**: Vercel

## セットアップ

### 前提条件

- Node.js 20以上
- npm または yarn
- Supabase プロジェクト
- Google Cloud プロジェクト（Calendar, Sheets, Gmail API有効化）

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google APIs
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
```

詳細は [docs/GOOGLE_API_SETUP.md](docs/GOOGLE_API_SETUP.md) を参照（未作成）

### 3. データベースマイグレーション

```bash
# Supabase CLIをインストール（未インストールの場合）
npm install -g supabase

# マイグレーション実行
supabase db push
```

または、Supabase Dashboardから `/supabase/migrations/` 内のSQLファイルを順番に実行

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く

## 主要コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Lint
npm run lint

# テスト実行（Phase 2で設定予定）
npm test
```

## ディレクトリ構成

```
know-pilates/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── member/          # 会員ページ
│   │   ├── admin/           # 管理画面
│   │   └── api/             # API Routes
│   ├── components/          # UIコンポーネント
│   ├── lib/                 # ビジネスロジック
│   │   ├── supabase/        # Supabase クライアント
│   │   └── google/          # Google APIs
│   └── types/               # TypeScript型定義
├── supabase/
│   └── migrations/          # DBマイグレーション
├── docs/                    # ドキュメント
│   ├── PROGRESS.md          # 実装進捗状況
│   └── ARCHITECTURE.md      # システム構成図
└── public/                  # 静的ファイル
```

## ドキュメント

- [実装進捗状況](docs/PROGRESS.md) - 機能の実装状況、既知の問題
- [システム構成図](docs/ARCHITECTURE.md) - アーキテクチャ、データフロー
- [手動テストチェックリスト](docs/MANUAL_TEST.md) - テスト手順（未作成）
- [Google API設定手順](docs/GOOGLE_API_SETUP.md) - 外部API設定（未作成）

## 開発ワークフロー（Git Worktree使用）

このプロジェクトでは、機能ごとにGit Worktreeを使用してブランチを分離します。

### Worktreeブランチ作成例

```bash
# チケット有効期限バグ修正
cd /Users/yumakamiya/AI駆動
git worktree add know-pilates-ticket-fix fix/ticket-expiry

# テスト環境構築
git worktree add know-pilates-test feature/test-setup

# 管理画面予約一覧
git worktree add know-pilates-admin feature/admin-reservations
```

### ブランチ命名規則

- `feature/` - 新機能
- `fix/` - バグ修正
- `docs/` - ドキュメントのみ

## デプロイ

### Vercelへのデプロイ

1. Vercelプロジェクトと連携
2. 環境変数を設定
3. Git pushで自動デプロイ

```bash
# Vercel CLIでデプロイ
npm install -g vercel
vercel
```

## 既知の問題

### HIGH優先度 🔴
1. **チケット有効期限チェックの不備**
   - 場所: `src/app/api/admin/tickets/route.ts:60`
   - 影響: 期限切れチケットが消費できてしまう
   - 対策: Phase 1で修正予定

### MEDIUM優先度 🟡
2. **管理画面予約一覧ページ未実装**
3. **Gmail API 7日期限問題**

詳細は [docs/PROGRESS.md](docs/PROGRESS.md) を参照

## 開発ロードマップ

### Phase 0: 準備作業 ✅ 進行中
- [x] 進捗管理ドキュメント作成
- [x] システム構成図作成
- [x] README更新

### Phase 1: チケット有効期限バグ修正
- [ ] `member_ticket_balance_valid` に修正
- [ ] チケット消費時に `expires_at` 設定
- [ ] 手動テスト

### Phase 2: テスト環境構築
- [ ] Jest + Testing Library セットアップ
- [ ] API Routeテスト作成
- [ ] コンポーネントテスト作成

### Phase 3: 管理画面強化
- [ ] 予約一覧ページ実装
- [ ] 検索・フィルター機能

### Phase 4: Gmail API認証延長
- [ ] テストユーザー追加

### Phase 5: 既存機能検証
- [ ] 手動テストチェックリスト作成
- [ ] 全機能検証

詳細は [プランファイル](/Users/yumakamiya/.claude/plans/mossy-seeking-swan.md) を参照

## デザインシステム

このプロジェクトは、50-60代女性向けのUX/UIデザインを採用しています：

- **フォントサイズ**: 最小18px（基本）
- **タップターゲット**: 最小44px（重要操作は48px）
- **カラー**:
  - Primary: ベージュ (#b89b73)
  - Accent: テラコッタ (#e06b4d)
- **トーン**: 寄り添い（「〜しましょう」「〜できます」）

詳細は `src/app/globals.css` の `@theme` 定義を参照

## ライセンス

Private - All Rights Reserved

## 問い合わせ

プロジェクト管理者: [@yumakamiya](https://github.com/yumakamiya)

---

**Note**: このプロジェクトは開発フェーズです。4ヶ月後のスタジオオープンを目指して開発中。
