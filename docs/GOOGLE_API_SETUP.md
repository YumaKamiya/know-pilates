# Google API設定ガイド

このドキュメントは、know-pilatesプロジェクトで使用するGoogle API（Gmail API、Google Calendar API、Google Sheets API）の設定手順を記載します。

---

## Gmail API OAuth認証設定

Gmail APIを使用して招待メール・予約確認メール・ウェルカムメールを送信します。

### 1. Google Cloud Consoleアクセス

1. https://console.cloud.google.com/ にアクセス
2. プロジェクト選択: `know-pilates` (または該当プロジェクト)

### 2. OAuth同意画面設定

1. 左メニュー → 「APIとサービス」 → 「OAuth同意画面」
2. 「テストユーザーを追加」をクリック
3. テストユーザーのGoogleアカウント追加:
   - 例: `studio@example.com`（実際のスタジオGoogleアカウント）
4. 「保存」をクリック

**重要**: テストユーザーに追加すると、リフレッシュトークンが**無期限**になります。

### 3. 新しいリフレッシュトークン取得

#### 3-1. Google OAuth Playgroundアクセス

1. https://developers.google.com/oauthplayground にアクセス
2. 右上の歯車アイコン → 「Use your own OAuth credentials」をチェック
3. 以下を入力（`.env.local` の値を使用）:
   - OAuth Client ID: `GMAIL_CLIENT_ID` の値
   - OAuth Client Secret: `GMAIL_CLIENT_SECRET` の値

#### 3-2. 認証フロー実行

1. 左側 Step 1:
   - スコープ入力: `https://www.googleapis.com/auth/gmail.send`
   - 「Authorize APIs」をクリック
2. Googleアカウントでログイン（**テストユーザーとして追加したアカウント**）
3. 権限承認画面で「許可」をクリック

#### 3-3. リフレッシュトークン取得

1. 左側 Step 2:
   - 「Exchange authorization code for tokens」をクリック
2. 表示された `Refresh token` をコピー
   - 例: `1//04WU17NB5x2mA...`（長い文字列）

### 4. 環境変数更新

#### ローカル開発環境（.env.local）

1. プロジェクトルートの `.env.local` ファイルを開く
2. `GMAIL_REFRESH_TOKEN` を新しいトークンに更新:
   ```
   GMAIL_REFRESH_TOKEN=1//04WU17NB5x2mA...（新しいトークン）
   ```
3. ファイル保存
4. 開発サーバーを再起動: `npm run dev`

#### 本番環境（Vercel）

1. Vercel Dashboard → プロジェクト選択 → Settings → Environment Variables
2. `GMAIL_REFRESH_TOKEN` を編集
3. 新しいトークンを貼り付け
4. 「Save」をクリック
5. デプロイを再実行（必要に応じて）

### 5. 動作確認

#### テストメール送信

1. 開発サーバー起動: `npm run dev`
2. 管理画面 → 会員管理 → 「新規招待」
3. テストメールアドレスを入力して招待メール送信
4. メール受信を確認

#### ログ確認

サーバーログでエラーがないことを確認:
```
✓ Gmail API: メール送信成功
```

### トラブルシューティング

#### エラー: "Gmail client not configured"

**原因**: 環境変数が設定されていない

**対処**:
1. `.env.local` に以下が含まれているか確認:
   ```
   GMAIL_CLIENT_ID=...
   GMAIL_CLIENT_SECRET=...
   GMAIL_REFRESH_TOKEN=...
   ```
2. 開発サーバーを再起動

#### エラー: "invalid_grant"

**原因**: リフレッシュトークンが期限切れまたは無効

**対処**:
1. 上記手順で新しいリフレッシュトークンを取得
2. `.env.local` を更新
3. 開発サーバーを再起動

### 将来的な対応

#### 本番公開申請（長期解決）

Google Consoleでアプリを「本番公開」に変更すれば、リフレッシュトークン有効期限の制限が完全に解除されます。

1. Google Console → OAuth同意画面
2. 「本番環境に移動」をクリック
3. 審査申請（Googleの承認が必要）

**メリット**:
- 無期限のトークン
- テストユーザー管理不要

**デメリット**:
- Google審査に時間がかかる（1-2週間）

---

## Gmail API動作確認チェックリスト

### 招待メール送信テスト

- [ ] 管理画面 → 会員管理 → 新規招待
- [ ] テストメールアドレス入力
- [ ] 招待メール受信確認
- [ ] 招待リンククリック → 登録ページ表示

### 予約確認メール送信テスト

- [ ] トップページ → 体験予約フォーム入力
- [ ] 予約確認メール受信（顧客向け）
- [ ] スタジオ向け通知メール受信

### 登録完了メール送信テスト

- [ ] 招待リンクから会員登録
- [ ] ウェルカムメール受信確認

### トークン有効期限確認

- [ ] 7日後もメール送信が正常動作（テストユーザー追加後）
- [ ] サーバーログにエラーなし

---

## Google Calendar API設定

スロット管理機能でGoogle Calendarと同期します。

### 1. Google Cloud Consoleで有効化

1. https://console.cloud.google.com/ → プロジェクト選択
2. 左メニュー → 「APIとサービス」 → 「ライブラリ」
3. 「Google Calendar API」を検索
4. 「有効にする」をクリック

### 2. サービスアカウント作成

1. 左メニュー → 「APIとサービス」 → 「認証情報」
2. 「認証情報を作成」 → 「サービスアカウント」
3. サービスアカウント名: `know-pilates-calendar`
4. 「完了」をクリック

### 3. サービスアカウントキー取得

1. 作成したサービスアカウントをクリック
2. 「キー」タブ → 「鍵を追加」 → 「新しい鍵を作成」
3. キーのタイプ: JSON
4. ダウンロードされたJSONファイルを保存

### 4. Google Calendarでサービスアカウントに権限付与

1. Google Calendar（https://calendar.google.com）にアクセス
2. 共有対象のカレンダーを選択 → 設定
3. 「特定のユーザーと共有」
4. サービスアカウントのメールアドレスを追加（例: `know-pilates-calendar@[PROJECT-ID].iam.gserviceaccount.com`）
5. 権限: 「予定の変更」を選択
6. 送信

### 5. 環境変数設定

`.env.local` に以下を追加:

```
GOOGLE_CLIENT_EMAIL=know-pilates-calendar@[PROJECT-ID].iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=[カレンダーID]@group.calendar.google.com
```

**注意**: `GOOGLE_PRIVATE_KEY` は改行を `\n` に置換してください。

---

## Google Sheets API設定

体験予約データを自動でGoogle Sheetsに記録します。

### 1. Google Cloud Consoleで有効化

1. https://console.cloud.google.com/ → プロジェクト選択
2. 左メニュー → 「APIとサービス」 → 「ライブラリ」
3. 「Google Sheets API」を検索
4. 「有効にする」をクリック

### 2. サービスアカウント（Calendar APIと共通）

Google Calendar APIで作成したサービスアカウントを使用します。

### 3. Google Sheetsでサービスアカウントに権限付与

1. Google Sheets（https://docs.google.com/spreadsheets）にアクセス
2. 共有対象のスプレッドシートを開く
3. 「共有」ボタンをクリック
4. サービスアカウントのメールアドレスを追加
5. 権限: 「編集者」を選択
6. 送信

### 4. 環境変数設定

`.env.local` に以下を追加:

```
GOOGLE_SHEET_ID=[スプレッドシートID]
```

**スプレッドシートIDの確認方法**:
- URLから取得: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`

---

## セキュリティ上の注意

1. **環境変数の管理**:
   - `.env.local` はGit管理外（`.gitignore`に含まれている）
   - リフレッシュトークン・秘密鍵を直接コミットしない

2. **本番環境（Vercel）の環境変数**:
   - Vercel Dashboardで設定
   - 環境変数は暗号化されて保存されます

3. **トークンローテーション**:
   - セキュリティのため定期的な更新を検討
   - 6ヶ月～1年ごとの更新推奨

4. **アクセス権限の最小化**:
   - サービスアカウントには必要最小限の権限を付与
   - カレンダー・スプレッドシートは特定のものだけ共有

---

## Gmail API使用箇所（参考）

現在のメール送信機能:

1. **招待メール**: `/api/admin/invitations` ([src/app/api/admin/invitations/route.ts:109](../src/app/api/admin/invitations/route.ts#L109))
2. **招待メール再送**: `/api/admin/invitations/[id]/resend` ([src/app/api/admin/invitations/[id]/resend/route.ts:69](../src/app/api/admin/invitations/%5Bid%5D/resend/route.ts#L69))
3. **登録完了メール**: `/api/auth/invitation/[token]` ([src/app/api/auth/invitation/[token]/route.ts:177](../src/app/api/auth/invitation/%5Btoken%5D/route.ts#L177))
4. **予約確認メール**: `/api/reservation/book` ([src/app/api/reservation/book/route.ts:75](../src/app/api/reservation/book/route.ts#L75))

すべて [src/lib/email/index.ts](../src/lib/email/index.ts) の `sendEmail()` 関数を使用。

---

## 関連ドキュメント

- [ARCHITECTURE.md](./ARCHITECTURE.md) - システム構成図
- [PROGRESS.md](./PROGRESS.md) - 実装進捗状況
- [WORKLOG.md](./WORKLOG.md) - 作業履歴
