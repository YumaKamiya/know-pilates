# 次のブレインセッション計画

## 現状サマリー（2025-11-29終了時点）

### 完了済み
- ✅ Phase 0: 進捗管理ドキュメント整備
- ✅ Phase 1: チケット有効期限バグ修正（HIGH優先度）
- ✅ CLAUDE.md更新（セッション間継続性確保）
- ✅ ワークフロー確立（ブレイン/実装セッション分離）

### 次のアクション
**Phase 2: テスト環境構築（Jest + Testing Library）**

---

## Phase 2計画詳細

### 目的
- テストフレームワークセットアップ
- API Routeテスト作成（tickets, reservations）
- 標準レベルのテストカバレッジ達成（50%以上）

### 実装内容

#### 1. テストフレームワークセットアップ
**ファイル**:
- `jest.config.js` - Next.js 16 App Router対応
- `jest.setup.js` - Testing Library設定
- `package.json` - devDependencies追加

**インストール**:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jest-environment-jsdom
npm install -D @types/jest
```

#### 2. API Routeテスト作成（優先度HIGH）

**テストファイル**:
1. `src/__tests__/api/admin/tickets.test.ts`
   - チケット付与テスト
   - チケット消費テスト（有効期限チェック含む）
   - 残高不足エラーテスト

2. `src/__tests__/api/member/reservations.test.ts`
   - 予約作成テスト（チケット消費確認）
   - 予約キャンセルテスト（チケット返却確認）
   - 期限切れチケット消費エラーテスト

#### 3. テスト実行・CI設定
- `npm test` でテスト実行可能に
- GitHub Actions設定（オプション）

### 技術的制約
- Next.js 16 App Router環境
- Supabase認証のモック必要
- service_role_key使用のRLSバイパステスト

### 完了条件
- [ ] jest.config.js, jest.setup.js作成
- [ ] API Routeテスト追加（tickets, reservations）
- [ ] `npm test` でテストパス
- [ ] PR作成（`gh pr create`）

### 成功基準
- テストカバレッジ 50%以上（重要API）
- 全テストパス
- CI/CDパイプライン設定（オプション）

---

## Worktree戦略

### ブランチ
- Name: `feature/test-setup`
- Worktree: `/Users/yumakamiya/AI駆動/know-pilates-test`

### 競合考慮
- Phase 2はテスト関連ファイルのみ作成
- 既存ソースコード変更なし
- 他Phaseとの競合なし

---

## 並列開発検討

Phase 2完了後、以下のPhaseを並列実施可能：

### Phase 3: 管理画面予約一覧ページ
- ファイル: `src/app/admin/reservations/page.tsx`, `src/app/api/admin/reservations/route.ts`
- Phase 2との競合: なし

### Phase 4: Gmail API認証期限延長
- ファイル: `.env.local`, `docs/GOOGLE_API_SETUP.md`
- Phase 2との競合: なし

**並列実施可能**: Phase 3とPhase 4は独立しているため、2つの実装セッションで並列開発可能

---

## 次のブレインセッションで実施すること

1. **Phase 2実装セッション用プロンプト作成**
   - 詳細な実装指示
   - テストコード例
   - 完了条件明記

2. **実装セッション起動指示**
   - プロンプト提供
   - Worktreeブランチ作成指示

3. **PR確認・マージ**
   - GitHub Claude Code自動レビュー確認
   - マージ判断・実行

4. **WORKLOG.md更新**
   - Phase 2完了記録
   - 次のアクション（Phase 3, 4並列実施検討）

---

## 参照ドキュメント

- [プランファイル](/Users/yumakamiya/.claude/plans/mossy-seeking-swan.md)
- [WORKLOG.md](WORKLOG.md)
- [PROGRESS.md](PROGRESS.md)
- [WORKFLOW.md](WORKFLOW.md)
