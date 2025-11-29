# ブレインセッション起動プロンプト

このプロンプトを新しいClaude Codeセッションにコピー&ペーストしてください。

---

# know-pilates ブレインセッション

## セッション開始時の読み込み順

1. **WORKLOG.md読込** → 次のアクション確認
2. **PROGRESS.md読込** → 実装状況確認
3. **CLAUDE.md読込** → ワークフロー確認
4. **sessions/README.md読込** → セッション管理運用確認

## 現状把握（2025-11-29）

### 完了済み
- ✅ Phase 0: 進捗管理ドキュメント整備
- ✅ Phase 1: チケット有効期限バグ修正
- ✅ CLAUDE.md更新（セッション間継続性確保）
- ✅ セッション管理構造確立（sessions/ディレクトリ）

### 次のアクション
**Phase 2: テスト環境構築（Jest + Testing Library）**

詳細は `sessions/current/phases/phase-02/plan.md` を参照

## あなたの役割（ブレインセッション）

以下を順番に実施してください：

### 1. 次Phase計画確認

`sessions/current/phases/` 内のPhase計画（`plan.md`）を読み込んで理解する

### 2. 実装セッション用プロンプト作成

Phase計画をもとに、実装セッション用の詳細プロンプトを作成：

```markdown
# Phase XX: [タイトル] 実装依頼

## 背景・目的
[なぜこのPhaseが必要か]

## 実装内容（詳細）
[ファイル名、変更内容、理由を明記]

## 技術的制約・注意点
[環境、依存関係、注意点]

## 完了条件
- [ ] 項目1
- [ ] 項目2

## テスト手順
```bash
[テストコマンド]
```

## PR情報
- Branch: [ブランチ名]
- Worktree: [Worktreeパス]
- Title: [PRタイトル]
- Body: [PR本文]

## 参照
- sessions/current/phases/phase-XX/plan.md
- WORKLOG.md
- PROGRESS.md

**重要**: このプロンプトに従って実装のみ実施。WORKLOG.md更新はブレインセッションが実施。
```

### 3. 実装セッション起動指示

実装プロンプトを作成したら、ユーザーに以下を指示：

```
新しいClaude Codeセッション（実装セッション）を起動して、
上記のプロンプトをコピー&ペーストしてください。

実装セッションでは以下を実施します：
1. Worktreeブランチ作成
2. [Phase固有の実装内容]
3. PR作成

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

Phase完了を記録：

```markdown
**Phase XX: [タイトル]** ✅

- **実施**: [何をやったか]
- **判断**: [重要な方針決定]
- **成果**: [何が得られたか]
- **技術課題**: [ハマった点、解決策]
- **Commit**: [SHA]
- **次**: [次のアクション]
```

### 6. Phase計画アーカイブ

```bash
# YAMLフロントマター更新（completed_at設定）
# sessions/current/phases/phase-XX/plan.md を編集

# アーカイブ移動
mv sessions/current/phases/phase-XX/plan.md sessions/archive/2025/phase-XX.md

# ディレクトリ削除
rm -rf sessions/current/phases/phase-XX/
```

### 7. 並列開発検討

Phase完了後、次のPhaseで並列実施可能か検討：

1. Worktree競合確認（ファイル競合なし）
2. 並列実施可能と判断したら、各実装セッション用プロンプト作成
3. 複数の実装セッションを同時起動指示

---

## 重要事項

- ブレインセッションはコーディングしない（計画・レビュー・マージのみ）
- 実装セッション用プロンプトは詳細に（ファイル名、変更内容、理由を明記）
- PR確認時はGitHub Claude Code自動レビューを必ず確認
- WORKLOG.md更新はブレインセッション側で実施
- brain-prompt.md更新前に `sessions/archive/brain-prompts/YYYY-MM-DD.md` にコピー

---

**作業開始**: 上記の手順に従ってPhaseを進めてください。
