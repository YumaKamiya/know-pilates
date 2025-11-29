# Phase 03: ディレクトリ構成整理 実装依頼

**重要**: このセッション全体を日本語で進めてください。
- すべての応答は日本語
- コードコメントは日本語（該当する場合）
- コミットメッセージは日本語
- エラー説明も日本語

## 背景・目的

Phase 2（テスト環境構築）が完了し、カバレッジ85.57%でテスト基盤が確立されました。

次のステップとして、2025-11-29にCodex Webサーチで取得したNext.js 16 App Router + Supabaseプロジェクトのベストプラクティスに基づき、ディレクトリ構成を整理します。

**目的**:
- ドキュメントディレクトリをクリーンに保つ（アクティブなドキュメントのみ）
- Codexレビュー結果を記録
- テストディレクトリ構成の方針を確認・記録

## 実装内容（詳細）

### 1. Worktree & ブランチ作成

```bash
# 親ディレクトリに移動
cd /Users/yumakamiya/AI駆動

# Worktree作成
git worktree add know-pilates-cleanup refactor/directory-cleanup

# Worktreeに移動
cd know-pilates-cleanup
```

### 2. デザインレビューファイルのアーカイブ移動

**対象ファイル**（3件）:
- `docs/design_review_lp_20251128.md`
- `docs/design_review_codex_20251128.md`
- `docs/design_improvement_plan_20251128.md`

**実施内容**:
```bash
# アーカイブディレクトリ作成
mkdir -p docs/archive/design-reviews

# git mvで移動（Git履歴を保持）
git mv docs/design_review_lp_20251128.md docs/archive/design-reviews/2025-11-28-lp.md
git mv docs/design_review_codex_20251128.md docs/archive/design-reviews/2025-11-28-codex.md
git mv docs/design_improvement_plan_20251128.md docs/archive/design-reviews/2025-11-28-improvement-plan.md
```

**理由**: デザインレビューは一時的な記録。アーカイブ化してdocs/をクリーンに保つ。

### 3. アーカイブREADME作成

**ファイル**: `docs/archive/design-reviews/README.md`

```markdown
# デザインレビューアーカイブ

このディレクトリは、一時的なデザインレビュー記録を保存します。

## ファイル命名規則

`YYYY-MM-DD-{レビュー種別}.md`

## アーカイブ一覧

### 2025-11-28
- **lp.md**: LP（ランディングページ）デザインレビュー
- **codex.md**: Codexによるコードレビュー（ディレクトリ構成）
- **improvement-plan.md**: デザイン改善プラン
```

### 4. テストディレクトリ構成確認

**Phase 2の実装結果**:
- テストディレクトリ: `src/tests/` を採用
- Codex推奨: `tests/unit/` だが、`src/tests/` で実装済み

**確認項目**:
1. `src/tests/` の構成を確認
2. Codex推奨の `tests/` との比較
3. 移行の必要性を評価

**判断基準**:
- Phase 2で `src/tests/` を使用しており、動作している
- 移行コスト vs メリットを評価
- 結論を `docs/CODEX_REVIEWS.md` に記録

### 5. Codexレビュー結果の記録

**ファイル**: `docs/CODEX_REVIEWS.md`（新規作成）

```markdown
# Codex Reviews

このファイルは、Codex（AI技術アドバイザー）によるレビュー結果を記録します。

## 2025-11-29: ディレクトリ構成レビュー

### レビュー内容
- Next.js 16 App Router + Supabaseベストプラクティス（Webサーチ）
- 参照: [Next.js Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- 参照: [Supabase Local Development](https://supabase.com/docs/guides/local-development/seeding-your-database)

### 即座に実施（Phase 0）
- ✅ WORK_LOG.md削除（WORKLOG.mdと重複）
- ✅ .gitignoreにsupabase/.temp/追加

### Phase 3で実施
- ✅ デザインレビューアーカイブ移動
- ✅ テストディレクトリ構成確認・記録

### テストディレクトリ構成の判断

**Codex推奨**:
\`\`\`
tests/
├── unit/
│   └── app/
│       ├── api/admin/tickets.test.ts
│       └── api/member/reservations.test.ts
└── e2e/ (将来)
\`\`\`

**実装結果（Phase 2）**:
\`\`\`
src/tests/
├── api/
│   ├── admin/tickets.test.ts
│   └── member/reservations.test.ts
└── helpers/
    ├── supabase-mock.ts
    └── google-mock.ts
\`\`\`

**判断**: `src/tests/` を継続使用
- **理由**:
  - Next.js 16公式ドキュメントでは `src/` 内にテストを配置することも推奨されている
  - Phase 2で実装済み、動作確認済み（カバレッジ85.57%達成）
  - 移行コストが高い（23テストケース + モックヘルパー）
  - `src/` 内配置でモジュール解決が自然（`@/` エイリアス活用）
- **メリット**:
  - テスト対象コードと同じ `src/` 内で管理
  - `jest.config.js` の設定がシンプル
  - IDEのモジュール解決がスムーズ

### 将来検討（Phase 5以降）
- App Routerグループ化（`(public)`, `(member)`, `(admin)`）
- コンポーネントコロケーション（`_components/`）

**見送り理由**: 大規模な移動が必要、既存構造で機能している、Phase 2テスト完了後に再評価
```

### 6. コミット & PR作成

```bash
# ステージング
git add .

# コミット
git commit -m "refactor(phase-03): ディレクトリ構成整理（Codexレビュー反映）

- デザインレビュー3件をアーカイブ移動
- docs/archive/design-reviews/README.md作成
- docs/CODEX_REVIEWS.md作成（レビュー結果記録）
- テストディレクトリ構成の方針確認・記録（src/tests/継続使用）

判断: src/tests/構成を継続（移行コスト高、動作確認済み、公式推奨範囲内）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# プッシュ
git push -u origin refactor/directory-cleanup

# PR作成
gh pr create --title "refactor(phase-03): ディレクトリ構成整理（Codexレビュー反映）" --body "$(cat <<'EOF'
## 概要
Codex Webサーチで取得したベストプラクティスに基づくディレクトリ整理

## 実施内容
- デザインレビューファイル3件をアーカイブ移動（git mv使用）
- docs/CODEX_REVIEWS.md作成（レビュー結果記録）
- テストディレクトリ構成の方針確認・記録

## 変更ファイル
- docs/design_review_*.md → docs/archive/design-reviews/YYYY-MM-DD-*.md
- docs/CODEX_REVIEWS.md（新規作成）
- docs/archive/design-reviews/README.md（新規作成）

## テストディレクトリ構成の判断
- **結論**: src/tests/ を継続使用
- **理由**: Phase 2で実装済み（カバレッジ85.57%）、移行コスト高、公式推奨範囲内

## 関連
- Phase 2: テスト環境構築の結果を踏まえて実施
- Codex Webサーチ結果（2025-11-29）
- WORKLOG.md#2025-11-29参照

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 技術的制約・注意点

1. **Git履歴保持**:
   - 必ず `git mv` を使用（`mv` コマンドは使用しない）
   - これによりファイル移動の履歴が追跡可能

2. **ファイル移動のみ**:
   - コード変更は一切なし
   - ドキュメント整理のみ

3. **Phase 2結果の確認**:
   - `src/tests/` ディレクトリ構成を確認
   - テストが正常に動作していることを確認（`npm test`）

## 完了条件

- [ ] Worktreeブランチ作成（`refactor/directory-cleanup`）
- [ ] デザインレビューファイル3件をアーカイブ移動（`git mv`使用）
- [ ] docs/archive/design-reviews/README.md作成
- [ ] docs/CODEX_REVIEWS.md作成
- [ ] テストディレクトリ構成の方針記録（src/tests/継続使用）
- [ ] `npm test`で全テストパス確認（移動による影響なし）
- [ ] PR作成（`gh pr create`）

## テスト手順

```bash
# 1. Worktree作成・移動
cd /Users/yumakamiya/AI駆動
git worktree add know-pilates-cleanup refactor/directory-cleanup
cd know-pilates-cleanup

# 2. ファイル移動・ドキュメント作成
# (上記の実施内容に従う)

# 3. テスト実行（移動による影響なし確認）
npm test

# 4. ファイル存在確認
ls docs/archive/design-reviews/
ls docs/CODEX_REVIEWS.md

# 5. Git履歴確認（移動がgit mvで記録されているか）
git log --follow docs/archive/design-reviews/2025-11-28-lp.md

# 6. PR作成
# (上記のコミット & PR作成手順に従う)
```

## PR情報

- **Branch**: `refactor/directory-cleanup`
- **Worktree**: `/Users/yumakamiya/AI駆動/know-pilates-cleanup`
- **Title**: `refactor(phase-03): ディレクトリ構成整理（Codexレビュー反映）`
- **Base Branch**: `main`

## 参照ファイル

実装時に参照するファイル:
- [docs/design_review_lp_20251128.md](../../docs/design_review_lp_20251128.md)
- [docs/design_review_codex_20251128.md](../../docs/design_review_codex_20251128.md)
- [docs/design_improvement_plan_20251128.md](../../docs/design_improvement_plan_20251128.md)
- [src/tests/](../../src/tests/)（Phase 2実装結果確認用）

## 重要事項

**⚠️ このプロンプトに従ってファイル移動のみ実施してください**
- コード変更は一切なし
- 必ず `git mv` を使用（`mv` コマンド禁止）
- WORKLOG.md更新は**ブレインセッション**が実施します
- PR作成後、PR URLをブレインセッションに報告してください
