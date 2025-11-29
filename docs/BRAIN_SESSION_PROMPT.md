# ブレインセッション起動プロンプト

以下のプロンプトを新しいClaude Codeセッションにコピー&ペーストしてください。

---

# know-pilates ブレインセッション（Phase 2以降）

## セッション開始時の読み込み順

1. **WORKLOG.md読込** → 次のアクション確認
2. **PROGRESS.md読込** → 実装状況確認
3. **CLAUDE.md読込** → ワークフロー確認

## 現状把握

### 完了済み（2025-11-29）
- ✅ Phase 0: 進捗管理ドキュメント整備（PROGRESS, ARCHITECTURE, README, WORKLOG, WORKFLOW）
- ✅ Phase 1: チケット有効期限バグ修正（member_ticket_balance_valid使用、expires_at設定）
- ✅ CLAUDE.md更新（セッション間継続性確保）

### 次のアクション
**Phase 2: テスト環境構築（Jest + Testing Library）**

詳細は `/Users/yumakamiya/AI駆動/know-pilates/docs/NEXT_SESSION_PLAN.md` を参照

## あなたの役割（ブレインセッション）

以下を順番に実施してください：

### 1. NEXT_SESSION_PLAN.md確認
`/Users/yumakamiya/AI駆動/know-pilates/docs/NEXT_SESSION_PLAN.md` を読み込んで、Phase 2の計画を理解する

### 2. Phase 2実装セッション用プロンプト作成

以下のテンプレートに従って、実装セッション用の詳細プロンプトを作成：

```markdown
# Phase 2: テスト環境構築 実装依頼

## 背景・目的
[なぜこのPhaseが必要か]

## 実装内容（詳細）
### 1. テストフレームワークセットアップ
- File: jest.config.js
- Change: Next.js 16 App Router対応のJest設定
- Config例:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

### 2. API Routeテスト作成
[具体的なテストコード例を含める]

## 技術的制約・注意点
- Next.js 16 App Router環境
- Supabase認証モック必要
- service_role_key使用のRLSバイパステスト

## 完了条件
- [ ] jest.config.js, jest.setup.js作成
- [ ] devDependenciesインストール
- [ ] API Routeテスト追加（tickets, reservations）
- [ ] `npm test` でテストパス
- [ ] PR作成

## テスト手順
```bash
cd /Users/yumakamiya/AI駆動/know-pilates-test
npm install
npm test
```

## PR情報
- Branch: feature/test-setup
- Worktree: /Users/yumakamiya/AI駆動/know-pilates-test
- Title: feat(phase-2): テスト環境構築
- Body: （上記「実装内容」を要約）

## 参照
- WORKLOG.md#2025-11-29
- PROGRESS.md（実装状況確認用）
- WORKFLOW.md（手順確認用）
- プランファイル: /Users/yumakamiya/.claude/plans/mossy-seeking-swan.md

**重要**: このプロンプトに従って実装のみ実施。WORKLOG.md更新はブレインセッションが実施。
```

### 3. 実装セッション起動指示

実装プロンプトを作成したら、ユーザーに以下を指示：

```
新しいClaude Codeセッション（実装セッション）を起動して、
上記のプロンプトをコピー&ペーストしてください。

実装セッションでは以下を実施します：
1. Worktreeブランチ作成
2. テストフレームワークセットアップ
3. API Routeテスト作成
4. PR作成

完了したらPR URLを教えてください。
```

### 4. PR確認・マージ

実装セッションからPR URLを受け取ったら：

```bash
# PRレビュー確認
gh pr view [PR番号] --web

# GitHub Claude Code自動レビュー確認
# 問題なければマージ
gh pr merge [PR番号] --squash
```

### 5. WORKLOG.md更新

Phase 2完了を記録：

```markdown
**Phase 2: テスト環境構築** ✅

- **実施**: Jest + Testing Library セットアップ、API Routeテスト作成
- **判断**:
  - 標準レベルのテスト戦略採用（重要APIに絞る）
  - Supabase認証モック化
  - [その他の判断]
- **成果**: テストカバレッジ50%達成、CI/CD基盤確立
- **技術課題**: [ハマった点があれば]
- **Commit**: [SHA]
- **次**: Phase 3, 4並列実施検討
```

### 6. 並列開発検討

Phase 2完了後、Phase 3（管理画面予約一覧）とPhase 4（Gmail API認証）の並列実施を検討：

1. Worktree競合確認（ファイル競合なし）
2. 並列実施可能と判断したら、各実装セッション用プロンプト作成
3. 2つの実装セッションを同時起動指示

---

## 重要事項

- ブレインセッションはコーディングしない（計画・レビュー・マージのみ）
- 実装セッション用プロンプトは詳細に（ファイル名、変更内容、理由を明記）
- PR確認時はGitHub Claude Code自動レビューを必ず確認
- WORKLOG.md更新はブレインセッション側で実施

---

**作業開始**: 上記の手順に従ってPhase 2を進めてください。
