# Vercel本番環境でのGoogle API認証エラー

## 現象
- **ローカル環境**: 正常動作（予約システムが完全に機能）
- **Vercel本番環境**: 500エラー

## エラー内容
```json
{
    "error": "Failed to fetch available slots",
    "details": "invalid_grant: Invalid grant: account not found"
}
```

## 発生箇所
- エンドポイント: `GET /api/reservation/slots?date=2025-11-27`
- ファイル: `src/app/api/reservation/slots/route.ts`
- 認証処理: `src/lib/google/auth.ts`

## 環境情報
- **フレームワーク**: Next.js 16.0.4
- **デプロイ先**: Vercel
- **認証方式**: Google Service Account (JWT)

## 設定済み環境変数（Vercel）
| 変数名 | 環境 | 状態 |
|--------|------|------|
| GOOGLE_SERVICE_ACCOUNT_EMAIL | Production, Preview | 設定済み |
| GOOGLE_PRIVATE_KEY | Production, Preview | 設定済み（実際の改行を含む形式） |
| GOOGLE_CALENDAR_ID | Production, Preview | 設定済み |
| GOOGLE_SHEETS_ID | Production, Preview | 設定済み |
| STUDIO_NAME | Production, Preview | 設定済み |
| STUDIO_EMAIL | Production, Preview | 設定済み |
| GMAIL_CLIENT_ID | Production, Preview | 設定済み |
| GMAIL_CLIENT_SECRET | Production, Preview | 設定済み |
| GMAIL_REFRESH_TOKEN | Production, Preview | 設定済み |

## 認証コード（src/lib/google/auth.ts）
```typescript
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/spreadsheets",
];

export function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  if (!privateKey || !clientEmail) {
    throw new Error("Google credentials not configured");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });

  return auth;
}
```

## ローカル環境変数（.env.local）
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=know-pilates@know-pilates.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBAD...(省略)...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=1096a858dbb2da98074970d87a20e77be7104283ede80ad1e8b98458e8184b18@group.calendar.google.com
GOOGLE_SHEETS_ID=1XvfJc-Xt1fZeHyNn3QRN8xgEGKERzWA_Y-Ox93W9hpU
```

## これまでに試したこと

### 1. 環境変数の形式
- `\n`をリテラル文字列として設定 → `DECODER routines::unsupported`エラー
- 実際の改行を含む形式で設定 → `invalid_grant: account not found`エラー

### 2. 環境の設定
- Production環境のみ → Preview環境でも設定
- Vercel CLIで設定 → ダッシュボードで確認

## 考えられる原因

### 1. サービスアカウントの問題
- サービスアカウントが無効化されている
- サービスアカウントのキーが失効している
- Google Cloud Projectで問題が発生している

### 2. 環境変数の不一致
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`の値がVercelで正しく設定されていない
- 秘密鍵とサービスアカウントメールの組み合わせが一致していない

### 3. Google Cloud側の設定
- Calendar API / Sheets APIが有効になっていない
- サービスアカウントにカレンダー/スプレッドシートへのアクセス権がない

## 確認が必要な項目

1. **Google Cloud Console**で:
   - サービスアカウント `know-pilates@know-pilates.iam.gserviceaccount.com` が存在するか
   - サービスアカウントのキーが有効か
   - Calendar API と Sheets API が有効か

2. **Vercelダッシュボード**で:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`の値が正確か確認
   - 環境変数が正しい環境（Production）に設定されているか

3. **Google Calendar / Sheets**で:
   - サービスアカウントにアクセス権が付与されているか

## 再現手順

1. https://know-pilates-i046wscn5-yks-projects-a2d094d9.vercel.app にアクセス
2. 予約セクションまでスクロール
3. 営業日の日付をクリック
4. DevToolsのNetworkタブで`slots`リクエストを確認
5. 500エラーとともに上記のJSONレスポンスが返る

## 参考情報

- Vercelプロジェクト: know-pilates
- Google Cloud Project: know-pilates
- サービスアカウント: know-pilates@know-pilates.iam.gserviceaccount.com

## Claude Codeで改善しない内容に関するレビュー（追記）

- Vercel本番で実際に読み込まれている環境変数の検証が未実施です。`vercel env pull` や一時的なAPIルートで `process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL` と `GOOGLE_PRIVATE_KEY?.slice(0, 40)` をログに出し、値に余計な引用符・スペース・改行欠落がないか確認してください。
- `invalid_grant: account not found` は削除・無効化されたサービスアカウントキーや異なるSAの組み合わせでも発生します。IAMで `know-pilates@...` が有効か、対応するキーが生きているかを確認し、必要なら同一SAでキーを再発行して差し替えてください。
- 改行問題の対処としてリテラル`\n`と生改行の2択しか試していません。`GOOGLE_PRIVATE_KEY_B64` をBase64保存し、コード側で `Buffer.from(..., "base64").toString("utf8")` で復元する方法を追加検証すると、改行・引用符混入のミスを防げます。Vercel上では鍵値を引用符で囲まない運用も明示してください。
- 認証処理を単体で切り分ける検証が不足しています。Vercel上で `new google.auth.JWT(...).authorize()` だけを実行して結果をログ出力する一時スクリプト/ルートを用意し、認証段階と予約ロジックのどちらで落ちているかを切り分けると調査が速くなります。
- カレンダー/スプレッドシートの共有条件が曖昧です。サービスアカウントのメールを対象リソースに編集権限で招待し、使用しているCalendar ID / Sheet IDが共有済みのものと一致しているかを明記してください。
