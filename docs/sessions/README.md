# セッション管理

このディレクトリはブレインセッションと実装セッション間の計画・実施状況を管理します。

## ディレクトリ構造

```
sessions/
├── README.md (このファイル)
├── current/
│   ├── brain-prompt.md (次回ブレインセッション起動用、常に最新)
│   └── phases/
│       ├── phase-02/
│       │   ├── plan.md (Phase計画詳細)
│       │   └── notes.md (実施中メモ、オプション)
│       └── phase-03/
│           └── plan.md
└── archive/
    ├── README.md (アーカイブ条件・検索方法)
    ├── 2025/
    │   ├── phase-00.md (完了済みPhase)
    │   └── phase-01.md
    └── brain-prompts/
        └── 2025-11-29.md (過去のブレインプロンプト)
```

## 命名規則

### Phase番号
- **ゼロ埋め2桁**: `phase-02`, `phase-03`, ...
- **並列派生がある場合**: `phase-03a`, `phase-03b`
- **ファイル名**: `plan.md` (必須), `notes.md` (オプション)

### YAMLフロントマター（plan.mdに必須）

```yaml
---
phase: 2
status: in-progress  # in-progress | completed
started_at: 2025-11-29
completed_at: null  # 完了時に日付設定
owner: brain-session
branch: feature/test-setup
worktree: /Users/yumakamiya/AI駆動/know-pilates-test
---
```

## 運用フロー

### 1. Phase開始時（ブレインセッション）

1. `current/phases/phase-XX/plan.md` 作成
2. YAMLフロントマターに必須情報記入：
   - `phase`: Phase番号
   - `status: in-progress`
   - `started_at`: 開始日
   - `branch`: Worktreeブランチ名
   - `worktree`: Worktreeパス
3. 実装内容詳細記載（背景・目的・実装内容・完了条件・テスト手順・PR情報）
4. `brain-prompt.md` 更新前に `archive/brain-prompts/YYYY-MM-DD.md` にコピー
5. `brain-prompt.md` を次回セッション用に上書き

### 2. 実装セッション

1. `current/phases/phase-XX/plan.md` を読み込み
2. 計画に従って実装
3. 必要に応じて `notes.md` に実施中メモ追加（オプション）
4. PR作成、GitHub Claude Code自動レビュー待ち

### 3. Phase完了時（ブレインセッション）

1. PRレビュー・マージ
2. `current/phases/phase-XX/plan.md` を編集：
   - YAMLフロントマター更新: `status: completed`, `completed_at: YYYY-MM-DD`
3. `archive/YYYY/phase-XX.md` に移動
4. `current/phases/phase-XX/` ディレクトリ削除
5. WORKLOG.md更新

### 4. 並列開発時

- `current/phases/` に複数Phaseフォルダが同時に存在可能
- 例: `phase-03/`, `phase-04/` が同時進行
- 各Phaseは独立したWorktreeブランチで実装

## セッション起動時の読み込み順

**すべてのセッション（ブレイン・実装共通）**:

1. **WORKLOG.md** → 次のアクション確認
2. **PROGRESS.md** → 実装状況確認
3. **CLAUDE.md** → ワークフロー確認

**ブレインセッション追加**:

4. **sessions/current/brain-prompt.md** → セッション役割確認

**実装セッション追加**:

4. **sessions/current/phases/phase-XX/plan.md** → Phase計画詳細

## アーカイブ戦略

### アーカイブ対象
- 完了したPhase計画（`plan.md`）
- 過去のブレインプロンプト

### アーカイブ先
- **Phase計画**: `archive/YYYY/phase-XX.md`（年単位）
- **ブレインプロンプト**: `archive/brain-prompts/YYYY-MM-DD.md`

### アーカイブタイミング
- Phase完了・PRマージ直後
- brain-prompt.md更新直前

### 検索方法
- YAMLフロントマターで検索: `grep -r "phase: 3" archive/`
- 完了日で検索: `grep -r "completed_at: 2025-11" archive/`

## Git Worktree連携

- **ブランチ命名**: Phaseと一致させる（例: `feature/phase-02-test-setup`）
- **Worktreeパス**: `/Users/yumakamiya/AI駆動/know-pilates-{feature名}`
- **plan.mdに記載**: `branch`, `worktree` フィールド必須

## 注意事項

- `brain-prompt.md` は常に最新（過去版はarchive/brain-prompts/）
- `current/phases/` は進行中Phaseのみ（完了したら即archive移動）
- YAMLフロントマター必須（検索・自動集計用）
- Phase番号はゼロ埋め2桁（並び順安定）
