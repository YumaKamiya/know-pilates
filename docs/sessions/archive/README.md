# セッションアーカイブ

完了したPhase計画と過去のブレインプロンプトを保管します。

## 構造

```
archive/
├── README.md (このファイル)
├── 2025/
│   ├── phase-00.md (Phase 0: 進捗管理ドキュメント整備)
│   ├── phase-01.md (Phase 1: チケット有効期限バグ修正)
│   └── phase-02.md (Phase 2: テスト環境構築)
└── brain-prompts/
    ├── 2025-11-29.md
    └── 2025-11-30.md
```

## アーカイブ条件

### Phase計画
- **条件**: PRマージ完了、Phase完了
- **移動元**: `current/phases/phase-XX/plan.md`
- **移動先**: `archive/YYYY/phase-XX.md`（完了年単位）
- **必須作業**:
  1. YAMLフロントマター更新（`status: completed`, `completed_at`設定）
  2. ファイル移動
  3. `current/phases/phase-XX/` ディレクトリ削除

### ブレインプロンプト
- **条件**: `brain-prompt.md` 更新時
- **コピー元**: `current/brain-prompt.md`
- **コピー先**: `archive/brain-prompts/YYYY-MM-DD.md`
- **タイミング**: 更新前に必ずコピー

## 検索方法

### Phase番号で検索
```bash
grep -r "phase: 3" archive/
```

### 完了日で検索
```bash
grep -r "completed_at: 2025-11" archive/
```

### ブランチ名で検索
```bash
grep -r "branch: feature/test-setup" archive/
```

### 特定期間のPhase一覧
```bash
ls -1 archive/2025/
```

## メンテナンス

- 年が変わったら新しい年ディレクトリ作成（例: `2026/`）
- 古いアーカイブ（2年以上前）は圧縮保存検討
- `brain-prompts/` は月次で整理可能（必要に応じて）
