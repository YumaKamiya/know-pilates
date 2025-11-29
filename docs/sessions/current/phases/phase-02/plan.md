---
phase: 2
status: pending
started_at: null
completed_at: null
owner: brain-session
branch: feature/test-setup
worktree: /Users/yumakamiya/AI駆動/know-pilates-test
---

# Phase 02: テスト環境構築

## 背景・目的

Phase 1でチケット有効期限バグを修正したが、テストがない状態ではリグレッション防止ができません。
テストフレームワークをセットアップし、重要なAPI Route（tickets, reservations）のテストを作成することで：

- リグレッション防止
- コードの信頼性向上
- CI/CD基盤確立

を実現します。

## 実装内容詳細

### 1. テストフレームワークセットアップ

**ファイル**:
- `jest.config.js` - Next.js 16 App Router対応のJest設定
- `jest.setup.js` - Testing Library設定
- `package.json` - devDependencies追加

**インストール**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jest-environment-jsdom
npm install -D @types/jest
```

**設定例**:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};
```

### 2. API Routeテスト作成（優先度HIGH）

**テストファイル**:

#### `src/__tests__/api/admin/tickets.test.ts`
- チケット付与テスト
- チケット消費テスト（有効期限チェック含む）
- 残高不足エラーテスト

**テストポイント**:
- `member_ticket_balance_valid` ビュー使用確認
- `expires_at` フィールド設定確認

#### `src/__tests__/api/member/reservations.test.ts`
- 予約作成テスト（チケット消費確認）
- 予約キャンセルテスト（チケット返却確認）
- 期限切れチケット消費エラーテスト

**テストポイント**:
- Optimistic locking動作確認
- Google Calendar同期エラー時のロールバック確認

### 3. テスト実行・CI設定

- `package.json` に `"test": "jest"` 追加
- `npm test` でテスト実行可能に
- GitHub Actions設定（オプション）

## 技術的制約・注意点

- Next.js 16 App Router環境
- Supabase認証のモック必要（`createClient` モック化）
- service_role_key使用のRLSバイパステスト
- Google Calendar API呼び出しモック化

## 完了条件

- [ ] jest.config.js, jest.setup.js作成
- [ ] devDependenciesインストール
- [ ] API Routeテスト追加（tickets, reservations）
- [ ] `npm test` でテストパス
- [ ] PR作成（`gh pr create`）

## 成功基準

- テストカバレッジ 50%以上（重要API）
- 全テストパス
- CI/CDパイプライン設定（オプション）

## テスト手順

```bash
cd /Users/yumakamiya/AI駆動/know-pilates-test
npm install
npm test
```

## PR情報

- **Branch**: `feature/test-setup`
- **Worktree**: `/Users/yumakamiya/AI駆動/know-pilates-test`
- **Title**: `feat(phase-02): テスト環境構築`
- **Body**:
  ```markdown
  ## 概要
  Jest + Testing LibraryのセットアップとAPI Routeテスト作成

  ## 実装内容
  - Jest設定（Next.js 16 App Router対応）
  - API Routeテスト（tickets, reservations）
  - テストカバレッジ50%以上達成

  ## テスト
  - `npm test` で全テストパス確認済み

  ## 関連
  - Phase 1: チケット有効期限バグ修正のリグレッション防止
  - WORKLOG.md#2025-11-29参照
  ```

## Worktree戦略

### ブランチ
- **Name**: `feature/test-setup`
- **Worktree**: `/Users/yumakamiya/AI駆動/know-pilates-test`

### 競合考慮
- Phase 2はテスト関連ファイルのみ作成
- 既存ソースコード変更なし
- 他Phaseとの競合なし

## 並列開発検討

Phase 2完了後、以下のPhaseを並列実施可能：

### Phase 3: 管理画面予約一覧ページ
- ファイル: `src/app/admin/reservations/page.tsx`, `src/app/api/admin/reservations/route.ts`
- Phase 2との競合: なし

### Phase 4: Gmail API認証期限延長
- ファイル: `.env.local`, `docs/GOOGLE_API_SETUP.md`
- Phase 2との競合: なし

**並列実施可能**: Phase 3とPhase 4は独立しているため、2つの実装セッションで並列開発可能

## 参照

- [WORKLOG.md](../../../WORKLOG.md)#2025-11-29
- [PROGRESS.md](../../../PROGRESS.md)（実装状況確認用）
- [WORKFLOW.md](../../../WORKFLOW.md)（手順確認用）

## 実装セッションへの指示

**重要**: このプロンプトに従って実装のみ実施。WORKLOG.md更新はブレインセッションが実施。
