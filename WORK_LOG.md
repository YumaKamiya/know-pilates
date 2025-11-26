# know（ノウ）ピラティススタジオ 開発ログ

## プロジェクト概要
- **クライアント**: お姉さんのピラティススタジオ「know（ノウ）」
- **目的**: LP + 予約システムの構築
- **技術スタック**: Next.js 16, Tailwind CSS v4, TypeScript

---

## Phase 1: LP実装 ✅

### 実装内容
- ヒーローセクション
- スタジオ紹介セクション
- インストラクター紹介
- レッスンメニュー
- 料金プラン
- アクセス情報
- お問い合わせセクション

### デプロイ
- **GitHub**: https://github.com/YumaKamiya/know-pilates
- **Vercel**: 初回デプロイ完了

---

## Phase 2: 予約システム実装 ✅

### 実装内容

#### 1. Google API連携
- **サービスアカウント**: `know-pilates@know-pilates.iam.gserviceaccount.com`
- **認証方式**: JWT認証
- **使用API**:
  - Google Calendar API - 予約枠管理、イベント作成
  - Google Sheets API - 予約データ保存

#### 2. 予約フォーム
- **ライブラリ**: React Hook Form + Zod
- **フロー**: 日付選択 → 時間選択 → お客様情報入力 → 確認 → 完了
- **営業時間**:
  - 月/水/金: 10:00-20:00
  - 火/木: 10:00-18:00
  - 土: 9:00-17:00
  - 日: 定休日

#### 3. API Routes
- `GET /api/reservation/slots?date=YYYY-MM-DD` - 空き枠取得
- `POST /api/reservation/book` - 予約作成

#### 4. メール通知（Gmail API）
- **認証方式**: OAuth2（リフレッシュトークン）
- **機能**:
  - 顧客への予約確認メール
  - スタジオへの新規予約通知メール
- **送信元**: OAuthで認証したGmailアドレス

### ファイル構成
```
src/
├── app/api/reservation/
│   ├── slots/route.ts    # 空き枠取得API
│   └── book/route.ts     # 予約作成API
├── components/reservation/
│   ├── ReservationForm.tsx  # 予約フォームコンポーネント
│   └── index.ts
├── lib/
│   ├── google/
│   │   ├── auth.ts       # Google認証（サービスアカウント）
│   │   ├── calendar.ts   # Calendar API
│   │   ├── sheets.ts     # Sheets API
│   │   └── index.ts
│   ├── email/
│   │   └── index.ts      # Gmail APIメール送信
│   └── validations/
│       └── reservation.ts # Zodスキーマ
```

### 環境変数 (Vercel設定済み)
```
# Google API（サービスアカウント）
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_CALENDAR_ID
GOOGLE_SHEETS_ID
STUDIO_NAME
STUDIO_EMAIL

# Gmail API（OAuth2）
GMAIL_CLIENT_ID
GMAIL_CLIENT_SECRET
GMAIL_REFRESH_TOKEN
```

### 本番URL
https://know-pilates-5vuelvu8m-yks-projects-a2d094d9.vercel.app

---

## Phase 3: 仕上げ（未着手）

1. **カスタムドメイン設定** - Vercelでドメイン紐付け
2. **コンテンツ調整** - 写真差し替え、テキスト修正
3. **アナリティクス** - Google Analytics導入
4. **OAuth同意画面の公開** - トークン有効期限の無期限化

---

## 技術メモ

### Resend vs Gmail API 比較（採用検討時）

#### 費用

| プラン | Resend | Gmail API |
|--------|--------|-----------|
| **無料枠** | 100通/日、3,000通/月 | 無料（API自体は無料） |
| **有料** | Pro: $20/月 (50,000通) | Google Workspace: $6/月〜 |
| **スケール** | Scale: $90/月 (100,000通) | Workspace上限に依存 |

#### 送信制限

| 条件 | Resend | Gmail API |
|------|--------|-----------|
| **無料アカウント** | 100通/日、3,000通/月 | 100受信者/日 |
| **Workspace** | - | 2,000通/日、3,000受信者/日 |
| **超過時** | 送信一時停止（課金なし） | 24時間送信停止 |

#### その他

| 項目 | Resend | Gmail API |
|------|--------|-----------|
| **ドメイン** | カスタムドメイン必要（有料） | 自分のGmail/Workspaceアドレス |
| **実装難易度** | 低（SDK充実） | 中〜高（OAuth、トークン管理） |
| **ログ保持** | 無料: 1日、Pro: 3日 | Gmailの送信済みに残る |
| **分析機能** | Pro以上で開封・クリック追跡 | なし |
| **到達率** | 高（専用インフラ） | 高（Google署名） |

### 採用結果

**Gmail API を採用**

理由:
- 月20-30人規模ならGmail APIで十分
- カスタムドメイン取得不要
- 将来サービス用Gmailに切り替え予定

### Gmail OAuth トークンの注意点

1. **テスト中の同意画面**: リフレッシュトークンは7日で期限切れ
2. **期限切れ時**: OAuth Playgroundで再取得 → Vercel環境変数更新
3. **本番運用時**: 同意画面を「公開」にすれば無期限（Google審査あり）

### OAuth設定手順（リフレッシュトークン再取得用）

1. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground) を開く
2. 歯車アイコン → Use your own OAuth credentials にチェック
3. Client ID/Secret を入力
4. Gmail API v1 → `gmail.send` スコープを選択
5. Authorize APIs → Googleアカウントでログイン
6. Exchange authorization code for tokens
7. Refresh token をコピー → Vercel環境変数を更新

### 参考リンク
- [Resend Pricing](https://resend.com/pricing)
- [Resend Free Tier](https://resend.com/blog/new-free-tier)
- [Gmail API Usage Limits](https://developers.google.com/workspace/gmail/api/reference/quota)
- [Gmail Sending Limits](https://support.google.com/a/answer/166852?hl=en)
