# know-pilates システム構成図

## システム概要

know-pilatesは、50-60代女性向けピラティススタジオの予約・会員管理SaaSシステムです。

**主要機能**:
- 会員予約システム（月プラン/回数券対応）
- 管理画面（会員・プラン・スロット・チケット管理）
- Google連携（Calendar, Sheets, Gmail）

---

## アーキテクチャ図

```
┌─────────────────────────────────────────────────────────┐
│                    ユーザー層                            │
├─────────────────────────────────────────────────────────┤
│  会員（50-60代女性）           管理者（スタジオスタッフ）  │
│  - 予約作成/キャンセル          - 会員管理                │
│  - チケット残高確認             - プラン管理              │
│  - ダッシュボード               - スロット管理            │
│                                - 予約管理（未実装）       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  フロントエンド層                         │
├─────────────────────────────────────────────────────────┤
│  Next.js 16 (App Router) + React 19                      │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  会員ページ    │  │  管理画面     │  │ ホームページ  │ │
│  │  /member/*    │  │  /admin/*    │  │  /           │ │
│  └───────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  Tailwind CSS v4（デザインシステム）                      │
│  - 50-60代向けUX（18px基本フォント、48pxタップ）           │
│  - ベージュ/テラコッタ配色                                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API層（Route Handlers）                 │
├─────────────────────────────────────────────────────────┤
│  /api/member/*              /api/admin/*                 │
│  ┌────────────────┐        ┌─────────────────┐          │
│  │ 予約作成/取得   │        │ 会員管理          │          │
│  │ 予約キャンセル  │        │ プラン管理        │          │
│  │                │        │ スロット管理      │          │
│  └────────────────┘        │ チケット管理      │          │
│                           │ 招待管理          │          │
│  /api/auth/*              └─────────────────┘          │
│  ┌────────────────┐                                     │
│  │ 会員登録        │        /api/reservation/*          │
│  │ 招待トークン    │        ┌─────────────────┐          │
│  └────────────────┘        │ 体験予約（Google） │          │
│                           └─────────────────┘          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  ビジネスロジック層                        │
├─────────────────────────────────────────────────────────┤
│  /src/lib/                                               │
│  ┌──────────────────────────────────────────────┐       │
│  │ Supabase クライアント                          │       │
│  │ - server.ts: SSR対応クライアント               │       │
│  │ - admin.ts: service_role（RLSバイパス）        │       │
│  └──────────────────────────────────────────────┘       │
│  ┌──────────────────────────────────────────────┐       │
│  │ Google APIs                                   │       │
│  │ - calendar.ts: イベント作成/更新/削除          │       │
│  │ - sheets.ts: 予約データ記録                   │       │
│  │ - gmail.ts: メール送信（招待・確認・通知）      │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    データ層                              │
├─────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL + Auth                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ テーブル      │  │ ビュー        │  │ 関数          │  │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤  │
│  │ members      │  │ member_      │  │ can_make_    │  │
│  │ plans        │  │ reservation_ │  │ reservation  │  │
│  │ member_plans │  │ availability │  │              │  │
│  │ slots        │  │              │  └──────────────┘  │
│  │ reservations │  │ member_      │                    │
│  │ ticket_logs  │  │ ticket_      │                    │
│  │ invited_     │  │ balance_     │                    │
│  │ invitations  │  │ valid        │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                          │
│  Row Level Security (RLS) 有効                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  外部サービス層                           │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Google       │  │ Google       │  │ Gmail API    │  │
│  │ Calendar API │  │ Sheets API   │  │              │  │
│  │              │  │              │  │ ⚠️ 7日期限   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## ディレクトリ構成

```
know-pilates/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx                # ホームページ（ランディング）
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── globals.css             # Tailwind設定（@theme構文）
│   │   │
│   │   ├── member/                 # 会員ページ
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   │   ├── invitation/     # 招待経由登録
│   │   │   │   └── complete/       # 登録完了
│   │   │   ├── dashboard/          # ダッシュボード
│   │   │   ├── reservation/        # 予約作成 ✅
│   │   │   └── reservations/       # 予約一覧 ✅
│   │   │
│   │   ├── admin/                  # 管理画面
│   │   │   ├── dashboard/          # 統計ダッシュボード ✅
│   │   │   ├── members/            # 会員管理 ✅
│   │   │   │   └── [id]/           # 会員詳細 ✅
│   │   │   ├── plans/              # プラン管理 ✅
│   │   │   ├── slots/              # スロット管理 ✅
│   │   │   └── reservations/       # 予約管理 ❌ 未実装
│   │   │
│   │   └── api/                    # API Routes
│   │       ├── auth/
│   │       │   ├── register/       # 会員登録
│   │       │   └── invitation/[token]/
│   │       ├── member/
│   │       │   └── reservations/   # 予約CRUD
│   │       │       └── [id]/       # キャンセル
│   │       ├── admin/
│   │       │   ├── members/        # 会員管理
│   │       │   ├── plans/          # プラン管理
│   │       │   ├── slots/          # スロット管理
│   │       │   ├── tickets/        # チケット管理 ⚠️ バグあり
│   │       │   ├── member-plans/   # プラン割り当て
│   │       │   └── invitations/    # 招待管理
│   │       └── reservation/
│   │           └── book/           # 体験予約（Google連携）
│   │
│   ├── components/                 # UIコンポーネント
│   │   ├── ui/                     # 共通UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── SectionTitle.tsx
│   │   ├── member/                 # 会員用コンポーネント
│   │   │   ├── MemberLayout.tsx
│   │   │   └── MobileCalendar.tsx
│   │   └── admin/                  # 管理画面用コンポーネント
│   │       ├── AdminLayout.tsx
│   │       ├── AdminSidebar.tsx
│   │       ├── MemberCard.tsx
│   │       └── MobileSlotCalendar.tsx
│   │
│   ├── lib/                        # ビジネスロジック
│   │   ├── supabase/
│   │   │   ├── server.ts           # SSRクライアント
│   │   │   └── client.ts           # ブラウザクライアント
│   │   └── google/
│   │       ├── index.ts            # Google API初期化
│   │       ├── calendar.ts         # Calendar API
│   │       ├── sheets.ts           # Sheets API
│   │       └── gmail.ts            # Gmail API
│   │
│   ├── types/
│   │   └── database.ts             # Supabase型定義
│   │
│   └── middleware.ts               # 認証・権限チェック
│
├── supabase/                       # データベース
│   └── migrations/
│       ├── 00001_create_tables.sql      # 基本スキーマ
│       ├── 00002_add_rls_policies.sql   # RLS設定
│       ├── 00003_add_constraints.sql    # 制約
│       ├── 00004_member_invitations.sql # 招待システム
│       └── 00005_reservation_limits.sql # 予約制限ロジック ⭐️
│
├── docs/                           # ドキュメント
│   ├── PROGRESS.md                 # 実装進捗
│   ├── ARCHITECTURE.md             # このファイル
│   ├── MANUAL_TEST.md              # 手動テスト（未作成）
│   └── GOOGLE_API_SETUP.md         # Google API設定（未作成）
│
├── public/                         # 静的ファイル
├── package.json                    # 依存関係
├── tsconfig.json                   # TypeScript設定
└── tailwind.config.ts              # Tailwind設定（v4）
```

---

## データフロー

### 1. 会員予約作成フロー

```
会員（ブラウザ）
    ↓ [1] スロット選択
/member/reservation/page.tsx
    ↓ [2] 予約可能チェック
    ↓ member_reservation_availability ビュー参照
    ↓ [3] 予約作成リクエスト
POST /api/member/reservations
    ↓ [4] 認証チェック（middleware）
    ↓ [5] can_make_reservation() DB関数呼び出し
    ↓ [6] スロット楽観的ロック（status='available'）
    ↓ [7] 予約レコード作成
    ↓ [8] チケット消費（回数券の場合）
    ↓     → ticket_logs INSERT (type='consume', amount=-1)
    ↓ [9] Google Calendar更新
    ↓     → updateCalendarEvent("【予約済】会員名様")
    ↓ [10] 成功レスポンス
    ↓
会員に予約確認表示
```

### 2. チケット残高計算フロー

```
会員ダッシュボード表示
    ↓
GET /api/member/dashboard
    ↓
member_ticket_balance_valid ビュー参照
    ↓
SELECT
  member_id,
  SUM(
    CASE
      WHEN expires_at IS NULL OR expires_at >= CURRENT_DATE
      THEN amount
      ELSE 0
    END
  ) AS balance
FROM ticket_logs
GROUP BY member_id
    ↓
有効期限内のチケット残高を取得
    ↓
ダッシュボードに表示
```

**⚠️ バグ**: `POST /api/admin/tickets` では `member_ticket_balance` を使用しており、有効期限を考慮していない

---

## 認証・認可フロー

### 認証層

```
リクエスト
    ↓
middleware.ts
    ↓ [1] CSRF チェック（Origin/Referer）
    ↓ [2] Cookie から session 取得
    ↓ [3] Supabase Auth で検証
    ↓
┌─────────────────┐
│ /member/*       │ → ログイン必須（registerは除外）
│ /api/member/*   │ → 会員本人のみアクセス可
└─────────────────┘
┌─────────────────┐
│ /admin/*        │ → 管理者ロール必須
│ /api/admin/*    │ → app_metadata.role = 'admin'
└─────────────────┘
```

### Row Level Security (RLS)

```
Supabase PostgreSQL
    ↓
RLS ポリシー有効
    ↓
┌──────────────────────────────────────┐
│ members                              │
│ → 会員は auth.uid() = auth_user_id   │
│    のレコードのみ SELECT 可能          │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ reservations                         │
│ → 会員は member_id が一致するもののみ │
│    SELECT/UPDATE/DELETE 可能         │
└──────────────────────────────────────┘
┌──────────────────────────────────────┐
│ plans, slots                         │
│ → すべてのユーザーが SELECT 可能      │
└──────────────────────────────────────┘

API層では service_role キーで RLS バイパス
→ API内で権限チェック実施
```

---

## データベース設計

### エンティティ関係図 (ER図)

```
┌─────────────┐
│  members    │
│  (会員)      │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────────┐         ┌─────────────┐
│ member_plans    │ N  →  1 │   plans     │
│ (会員プラン)     │         │  (プラン)    │
└─────────────────┘         └─────────────┘
       │ 1
       │
       │ N
┌──────▼──────────┐
│  ticket_logs    │
│ (チケット履歴)   │
└─────────────────┘

┌─────────────┐
│  members    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼──────────┐         ┌─────────────┐
│  reservations   │ N  →  1 │   slots     │
│   (予約)        │         │  (枠)        │
└─────────────────┘         └─────────────┘

┌─────────────┐
│  members    │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────▼────────────┐
│ invited_invitations│
│   (招待トークン)    │
└───────────────────┘
```

### 重要ビュー・関数

**member_reservation_availability ビュー**
- 会員の予約可能状況を一元管理
- 月プラン: 当月残数、翌月残数
- 回数券: チケット残高、有効期限

**can_make_reservation() 関数**
- 予約可能かをチェック
- 月プラン: 月上限チェック
- 回数券: 残高チェック
- 返却: (can_reserve BOOLEAN, reason TEXT, plan_type TEXT)

---

## デプロイ構成

```
┌─────────────────────────────────────────┐
│  Vercel (Production)                     │
│  - Next.js SSR                           │
│  - Edge Functions                        │
│  - 環境変数（.env.production）            │
│    - NEXT_PUBLIC_SUPABASE_URL            │
│    - SUPABASE_SERVICE_ROLE_KEY           │
│    - GOOGLE_* (Calendar, Sheets, Gmail)  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Supabase Cloud                          │
│  - PostgreSQL Database                   │
│  - Auth (JWT)                            │
│  - Realtime (未使用)                     │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  Google Cloud                            │
│  - Calendar API                          │
│  - Sheets API                            │
│  - Gmail API ⚠️ 7日期限                 │
└─────────────────────────────────────────┘
```

---

## セキュリティ対策

### 実装済み ✅
- CSRF対策（Origin/Referer検証）
- パスワード要件（8文字以上）
- メール重複チェック
- RLS（Row Level Security）
- 管理者ロール検証
- 楽観的ロック（スロット予約）

### 未実装 ❌
- レート制限（API Rate Limiting）
- SQLインジェクション対策（Supabaseが対応）
- XSS対策（Reactが基本対応）
- 多要素認証（2FA）

---

## パフォーマンス最適化

### 実装済み ✅
- Next.js App Router（サーバーコンポーネント）
- Supabase RLS（データベース層での権限制御）
- 楽観的ロック（並行処理対策）

### 未実装 ❌
- データベースインデックス最適化
- クエリキャッシュ
- CDN活用（画像等）
- コード分割（dynamic import）

---

## 技術的負債

### HIGH優先度 🔴
1. **チケット有効期限チェックの不備**
   - 場所: `src/app/api/admin/tickets/route.ts:60`
   - 対策: Phase 1で修正

### MEDIUM優先度 🟡
2. **テスト環境未構築**
   - 対策: Phase 2で Jest セットアップ

3. **Gmail API 7日期限問題**
   - 対策: Phase 4でテストユーザー追加

### LOW優先度 🟢
4. **月初チケット自動付与バッチ未実装**
5. **プラン変更時のトランザクション化**
6. **管理画面予約一覧ページ未実装**

---

## 拡張性検討

### 将来的な機能拡張候補
- 決済機能（Stripe/Square）
- メッセージング機能（リマインダー、キャンペーン）
- レポート・分析機能
- キャンセル待ち機能
- 多言語対応
- モバイルアプリ（React Native）

---

## 参考資料

- [実装進捗状況](./PROGRESS.md)
- [プランファイル](/Users/yumakamiya/.claude/plans/mossy-seeking-swan.md)
- Next.js 16 ドキュメント: https://nextjs.org/docs
- Supabase ドキュメント: https://supabase.com/docs
- Tailwind CSS v4: https://tailwindcss.com/docs
