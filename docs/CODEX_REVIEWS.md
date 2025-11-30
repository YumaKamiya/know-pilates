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
```
tests/
├── unit/
│   └── app/
│       ├── api/admin/tickets.test.ts
│       └── api/member/reservations.test.ts
└── e2e/ (将来)
```

**実装結果（Phase 2）**:
```
src/tests/
├── api/
│   ├── admin/tickets.test.ts
│   └── member/reservations.test.ts
└── helpers/
    ├── supabase-mock.ts
    └── google-mock.ts
```

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
