# know-pilates開発

## Session State
- **Phase**: 0 (準備)
- **Goal**: セッション管理構造確立、Phase 2準備完了
- **Branch/PR**: main (PRなし)
- **Next**: Phase 2実装セッション起動
- **Updated**: 2025-11-29
- **Risks**: なし
- **Status**: ✅ active

## Workflow

### ブレインセッション（計画・レビュー・マージ）
1. Phase計画・Worktree競合考慮
2. 実装セッション用プロンプト作成
3. 実装セッション起動指示
4. PR確認（GitHub Claude Code自動レビュー）
5. マージ判断・実行（`gh pr merge --squash`）
6. WORKLOG.md更新（実施、判断、成果、技術課題、次）

### 実装セッション（コーディングのみ）
1. ブレインからのプロンプト受取
2. コーディング・テスト実行
3. PR作成（`gh pr create`）
4. 完了報告

### 全セッション共通ルール

**Entry Ritual**:
1. WORKLOG.md → PROGRESS.md → CLAUDE.md 読込
2. Session State freshness確認（≤48h？）
3. Active worktree確認、Blockers記録

**Exit Ritual**:
1. Session State更新（Updated, Next, Risks）
2. Decisions記録（≤3件維持）
3. 次アクション明記

**PR & Worktree**:
- 直接mainマージ禁止（PR必須）
- Worktree命名: `/Users/yumakamiya/AI駆動/know-pilates-{feature}`
- Branch命名: `feature/{phase-XX}-{description}`
- マージ: `gh pr merge --squash`

## 運用ルール

**新しいワークフローを設計したら必ず**:
1. 該当ドキュメントに詳細記載（例: sessions/README.md）
2. CLAUDE.mdには参照リンクのみ追加（詳細は書かない）
3. Session State更新（現在の運用状況を1-2行で）

**例**: セッション管理 → [sessions/README.md](docs/sessions/README.md)

## References（詳細は各ファイル参照）
- Sessions: [docs/sessions/README.md](docs/sessions/README.md)
- Workflow: [docs/WORKFLOW.md](docs/WORKFLOW.md)
- Log: [docs/WORKLOG.md](docs/WORKLOG.md)
- Progress: [docs/PROGRESS.md](docs/PROGRESS.md)
- Arch: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Commands (詳細は[WORKFLOW.md](docs/WORKFLOW.md))
- Dev: `npm run dev`
- Test: `npm test`

## Standards
- Next.js 16, React 19, Tailwind CSS v4, TypeScript
- 50-60代女性向けUX: 最小18px、タップ44-48px
- Commit: feat/fix/docs(phase-X): 概要 + 判断の意図
- PR: `gh pr create` （テンプレート: プランファイル参照）

## Decisions（最新3件のみ）
- 2025-11-29: セッション管理構造確立（sessions/） → Phase計画の永続化、並列開発対応
- 2025-11-29: ローカルファイル中心+Notion補完 → セッション間継続性、トークン効率化
- 2025-11-29: Worktree前提開発 → 機能ごとに独立環境、並列開発可能

---

## Status Legend
- ✅ active: 作業中（48h以内更新）
- 💤 stale: 48h以上未更新
- ⛔ blocked: 外部依存で停止中

**Note**: CLAUDE.mdは軽量化重視。詳細はReferencesへ。Session State: 作業時必ず更新（Entry/Exit Ritual）。
