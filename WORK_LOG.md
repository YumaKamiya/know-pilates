# know（ノウ）ピラティススタジオ 開発ログ

## プロジェクト概要
- **クライアント**: お姉さんのピラティススタジオ「know（ノウ）」
- **目的**: LP + 予約システムの構築
- **技術スタック**: Next.js 16, Tailwind CSS v4, TypeScript

---

## Phase 1: LP実装 (完了)

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
- **Vercel**: https://know-pilates.vercel.app (初回デプロイ)

---

## Phase 2: 予約システム実装 (完了 - 2024/11/26)

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

#### 4. メール通知 (オプション)
- **ライブラリ**: Resend
- **機能**:
  - 顧客への予約確認メール
  - スタジオへの新規予約通知メール
- **ステータス**: APIキー未設定（設定すれば有効化）

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
│   │   ├── auth.ts       # Google認証
│   │   ├── calendar.ts   # Calendar API
│   │   ├── sheets.ts     # Sheets API
│   │   └── index.ts
│   ├── email/
│   │   └── index.ts      # Resendメール送信
│   └── validations/
│       └── reservation.ts # Zodスキーマ
```

### 環境変数 (Vercel設定済み)
```
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_CALENDAR_ID
GOOGLE_SHEETS_ID
STUDIO_NAME
STUDIO_EMAIL
```

### 本番URL
https://know-pilates-7oayuf6i9-yks-projects-a2d094d9.vercel.app

---

## 次のステップ (未実装)

### Phase 3候補
1. **カスタムドメイン設定** - Vercelでドメイン紐付け
2. **メール通知有効化** - Resend APIキー取得・設定
3. **コンテンツ調整** - 写真差し替え、テキスト修正
4. **アナリティクス** - Google Analytics導入

---

## 技術メモ

### Resend vs Gmail API 比較

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

### 推奨

**このプロジェクト（小規模ピラティススタジオ）の場合:**

| 選択肢 | メリット | デメリット |
|--------|----------|------------|
| **Resend（現在実装）** | 実装済み、シンプル、スケール可能 | カスタムドメイン必要、無料枠小さめ |
| **Gmail API** | 無料で十分、既存インフラ活用 | OAuth実装が複雑、トークン管理必要 |

**結論**: 月の予約が30件以下なら**Gmail API**で十分。成長を見越すなら**Resend**のまま。

### Gmail API実装時の追加作業
1. OAuth同意画面の設定（公開審査が必要な場合あり）
2. リフレッシュトークンの取得・保存
3. トークン自動更新ロジック
4. Base64エンコードでのメール本文構築
5. サービスアカウントの場合はドメイン全体の委任が必要

### 参考リンク
- [Resend Pricing](https://resend.com/pricing)
- [Resend Free Tier](https://resend.com/blog/new-free-tier)
- [Gmail API Usage Limits](https://developers.google.com/workspace/gmail/api/reference/quota)
- [Gmail Sending Limits](https://support.google.com/a/answer/166852?hl=en)

現在はResendを実装済み。Gmail APIに切り替える場合は`src/lib/email/index.ts`を書き換える。
