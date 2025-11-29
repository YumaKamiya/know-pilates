# 開発ワークフローガイド

このドキュメントは、know-pilatesプロジェクトの開発ワークフローを定義します。

---

## ドキュメント体系

### 📋 WORKLOG.md（作業履歴・頻繁アクセス）
- **目的**: 時系列の作業履歴、次のアクション把握
- **更新**: 各Phase完了時
- **読者**: Claude（新セッション開始時）、開発者
- **内容**: 実施内容、判断、成果、次のアクション

### 📊 PROGRESS.md（実装状況・静的）
- **目的**: 機能の実装状況、既知の問題把握
- **更新**: 実装状況が大きく変わった時のみ
- **読者**: 開発者、レビュワー
- **内容**: 機能完成度、技術スタック、既知の問題

### 🏗️ ARCHITECTURE.md（システム構成・静的）
- **目的**: システム全体の構成理解
- **更新**: アーキテクチャ変更時のみ
- **読者**: 開発者、新規参加者
- **内容**: レイヤー構成、データフロー、ER図

### 💡 Notion（重要判断・オプショナル）
- **目的**: 大きな技術選定、複雑な判断の背景記録
- **更新**: 重要な判断があった時のみ
- **読者**: プロジェクトマネージャー、長期コンテキスト必要時
- **内容**: なぜその判断か、代替案検討、技術的背景

---

## Phase完了時のワークフロー

### 標準フロー

```bash
# 1. WORKLOG.md 更新
vim docs/WORKLOG.md
# フォーマットに従ってPhase完了を記録

# 2. Git commit（判断の意図を含める）
git add .
git commit -m "feat(phase-X): [概要]

[詳細な実施内容]

判断: [重要な方針決定]

Refs: WORKLOG.md#YYYY-MM-DD
"

# 3. Git push
git push

# 4. （オプション）Notion記録
# 大きな技術選定や複雑な判断があった場合のみ
```

### Gitコミットメッセージ例

```
feat(phase-0): 進捗管理ドキュメント整備

- PROGRESS.md作成（実装状況サマリー）
- ARCHITECTURE.md作成（システム構成図）
- README更新（Worktree運用）

判断: Git Worktree前提の開発フロー、チケット有効期限バグを最優先（HIGH）

Refs: WORKLOG.md#2025-11-29
```

---

## Notion記録のガイドライン

### 記録する場合 ✅
- 大きな技術選定（例: テストフレームワーク選定理由）
- 複雑なバグ修正の試行錯誤プロセス
- アーキテクチャ変更の背景と理由
- ユーザーに相談して判断を仰いだ内容

### 記録しない場合 ❌
- 単純なバグ修正（WORKLOG.mdで十分）
- ドキュメント更新
- 定型的な機能追加

### Notion記録のトリガー
「ユーザーに相談した内容」 → Notion記録
「自分で判断して進めた内容」 → WORKLOG.mdのみ

---

## 新セッション開始時の読み込み順

Claudeが新しいセッションを開始する際の推奨読み込み順：

```
1. WORKLOG.md（直近の作業、次のアクション把握）
   ↓
2. PROGRESS.md（実装状況、既知の問題確認）
   ↓
3. README.md（環境設定、セットアップ確認）
   ↓
4. （必要に応じて）ARCHITECTURE.md
   ↓
5. （必要に応じて）Notion（重要判断の背景）
```

この順序で読めば、**探索なしで作業再開可能**。

---

## Git Worktree運用

### ブランチ作成

```bash
cd /Users/yumakamiya/AI駆動

# 機能開発
git worktree add know-pilates-feature-name feature/feature-name

# バグ修正
git worktree add know-pilates-fix-name fix/fix-name

# ドキュメントのみ
git worktree add know-pilates-docs docs/docs-name
```

### ブランチ命名規則
- `feature/` - 新機能
- `fix/` - バグ修正
- `docs/` - ドキュメントのみ

### 作業完了後

```bash
cd know-pilates-feature-name

# 作業、コミット
git add .
git commit -m "..."
git push -u origin feature/feature-name

# PRマージ後、worktree削除
cd ..
git worktree remove know-pilates-feature-name
```

---

## TodoWrite運用

### Phase開始時
```
Phase開始時にTodoWrite更新（スコープ・タスク設定）
```

### Phase完了時
```
TodoWrite更新（Phase完了マーク）
次のPhaseのタスクを追加
```

---

## トラブルシューティング

### WORKLOG.mdが肥大化した場合
月末に `docs/worklogs/YYYY-MM.md` にアーカイブ

### Gitコミットに判断の意図を書き忘れた場合
`git commit --amend` で修正（pushする前）

### 新セッションで次のアクションが不明な場合
1. WORKLOG.mdの「次」フィールド確認
2. PROGRESS.mdの「既知の問題」確認
3. プランファイル確認: `/Users/yumakamiya/.claude/plans/mossy-seeking-swan.md`

---

## まとめ

**ローカルファイル中心 + Notion補完**のハイブリッド方式で：
- ✅ 即座にアクセス可能（オフラインOK）
- ✅ Git管理で履歴追跡
- ✅ 新セッションで探索不要
- ✅ 重要判断はNotionで深掘り

このワークフローで、**セッション間のコンテキスト継続性**を実現します。
