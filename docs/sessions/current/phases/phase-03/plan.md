---
phase: 3
status: pending
started_at: null
completed_at: null
owner: brain-session
branch: refactor/directory-cleanup
worktree: /Users/yumakamiya/AI駆動/know-pilates-cleanup
---

# Phase 03: ディレクトリ構成整理（Codexレビュー反映）

## 背景・目的

2025-11-29にCodex Webサーチで取得したNext.js 16 App Router + Supabaseプロジェクトのベストプラクティス（2024-2025）に基づき、ディレクトリ構成を整理します。

Phase 2（テスト環境構築）完了後、以下の改善を実施：

1. ドキュメントアーカイブ整理
2. テストディレクトリ構成の最終確認（Phase 2結果を踏まえて）
3. 将来的なリファクタリング方針の記録

## 実装内容詳細

### 1. ドキュメントアーカイブ整理

**対象ファイル**:
- `docs/design_review_lp_20251128.md`
- `docs/design_review_codex_20251128.md`
- `docs/design_improvement_plan_20251128.md`

**実施内容**:
```bash
mkdir -p docs/archive/design-reviews
mv docs/design_review_lp_20251128.md docs/archive/design-reviews/2025-11-28-lp.md
mv docs/design_review_codex_20251128.md docs/archive/design-reviews/2025-11-28-codex.md
mv docs/design_improvement_plan_20251128.md docs/archive/design-reviews/2025-11-28-improvement-plan.md
```

**理由**: デザインレビューは一時的な記録であり、アーカイブ化してdocs/をクリーンに保つ

### 2. テストディレクトリ構成確認

**Phase 2実装結果の確認項目**:
- Phase 2で作成したテストディレクトリ（`src/__tests__/` or `tests/`）
- Codex推奨の `tests/unit/` 構成との比較
- 必要に応じて移行計画を作成

**Codex推奨構成**:
```
tests/
├── unit/
│   └── app/
│       ├── api/admin/tickets.test.ts
│       └── api/member/reservations.test.ts
└── e2e/ (将来)
```

**判断基準**:
- Phase 2で `src/__tests__/` を使用した場合、移行のコストとメリットを評価
- 移行しない場合は理由を記録（ARCHITECTURE.md更新）

### 3. Codexレビュー結果の記録

**docs/CODEX_REVIEWS.md作成**（新規）:
```markdown
# Codex Reviews

## 2025-11-29: ディレクトリ構成レビュー

### レビュー内容
- Next.js 16 App Router + Supabaseベストプラクティス（Webサーチ）
- 参照: [nextjs.org](https://nextjs.org/docs/app/getting-started/project-structure)
- 参照: [supabase.com](https://supabase.com/docs/guides/local-development/seeding-your-database)

### 即座に実施（Phase 0）
- ✅ WORK_LOG.md削除
- ✅ .gitignoreにsupabase/.temp/追加

### Phase 3で実施
- デザインレビューアーカイブ移動
- テストディレクトリ構成確認

### 将来検討（Phase 4以降）
- App Routerグループ化（`(public)`, `(member)`, `(admin)`）
- コンポーネントコロケーション（`_components/`）
```

## 技術的制約・注意点

- Phase 2完了・PRマージ後に実施（mainブランチで作業）
- ファイル移動のみ（コード変更なし）
- Git履歴保持のため `git mv` 使用

## 完了条件

- [ ] デザインレビューファイル3件をアーカイブ移動
- [ ] docs/archive/design-reviews/README.md作成
- [ ] テストディレクトリ構成確認・判断記録
- [ ] docs/CODEX_REVIEWS.md作成
- [ ] PR作成（`gh pr create`）

## 成功基準

- docs/がクリーンになる（アクティブなドキュメントのみ）
- Codexレビュー結果が記録される
- テストディレクトリ構成の方針が明確化

## テスト手順

```bash
# ファイル存在確認
ls docs/archive/design-reviews/
ls docs/CODEX_REVIEWS.md

# Git履歴確認（移動がgit mvで記録されているか）
git log --follow docs/archive/design-reviews/2025-11-28-lp.md
```

## PR情報

- **Branch**: `refactor/directory-cleanup`
- **Worktree**: `/Users/yumakamiya/AI駆動/know-pilates-cleanup`
- **Title**: `refactor(phase-03): ディレクトリ構成整理（Codexレビュー反映）`
- **Body**:
  ```markdown
  ## 概要
  Codex Webサーチで取得したベストプラクティスに基づくディレクトリ整理

  ## 実施内容
  - デザインレビューファイルをアーカイブ移動
  - docs/CODEX_REVIEWS.md作成（レビュー結果記録）
  - テストディレクトリ構成の方針確認

  ## 変更ファイル
  - docs/design_review_*.md → docs/archive/design-reviews/
  - docs/CODEX_REVIEWS.md（新規作成）
  - docs/archive/design-reviews/README.md（新規作成）

  ## 関連
  - Phase 2: テスト環境構築の結果を踏まえて実施
  - Codex Webサーチ結果（2025-11-29）
  ```

## Worktree戦略

### ブランチ
- **Name**: `refactor/directory-cleanup`
- **Worktree**: `/Users/yumakamiya/AI駆動/know-pilates-cleanup`

### 競合考慮
- ファイル移動のみ（既存コード変更なし）
- 他Phaseとの競合なし

## 将来的なリファクタリング（Phase 4以降で検討）

Codexが推奨したが、今回は見送る項目：

### App Routerグループ化
```
src/app/
├── (public)/
│   ├── layout.tsx
│   └── page.tsx
├── (member)/
│   └── dashboard/
└── (admin)/
    └── users/
```

**見送り理由**: 大規模な移動が必要、Phase 2テスト完了後に再評価

### コンポーネントコロケーション
```
src/app/(member)/dashboard/
├── page.tsx
└── _components/
    └── DashboardCard.tsx
```

**見送り理由**: 既存構造でも機能している、必要性を再評価

## 参照

- [WORKLOG.md](../../../WORKLOG.md)
- [ARCHITECTURE.md](../../../ARCHITECTURE.md)
- Codex Webサーチ結果（2025-11-29、このセッションで取得）

## 実装セッションへの指示

**重要**: このプロンプトに従ってファイル移動のみ実施。コード変更なし。WORKLOG.md更新はブレインセッションが実施。
