# 作業ログ

このファイルは、know-pilatesプロジェクトの作業履歴を時系列で記録します。

**運用方針**:
- 各Phase完了時に記録
- ローカルファイル中心（即座にアクセス可能）
- 重要な判断はGitコミットメッセージにも記載
- Notionは大きな技術選定や複雑な判断のみ記録

---

## 2025-11

### 2025-11-29

**Phase 0: 準備作業** ✅

- **実施**: PROGRESS.md、ARCHITECTURE.md、README、WORKLOG.md、WORKFLOW.md作成
- **判断**:
  - Git Worktree前提の開発フロー採用（機能ごとに独立環境）
  - チケット有効期限バグを最優先（HIGH）と判断（収益損失リスク）
  - ワークフロー設計: WORKLOG.md（ローカル中心） + Notion（重要判断のみ）
  - Codex相談でローカルファイル中心のハイブリッド方式を確立
- **成果**: 探索なしで実装状況把握可能に、5ドキュメント（約1,400行）
- **Commit**: f79dd9a, c02f056
- **次**: Phase 1 - fix/ticket-expiry でチケット有効期限バグ修正

**Phase 1: チケット有効期限バグ修正** ✅

- **実施**: member_ticket_balance → member_ticket_balance_validに修正、expires_at明示的設定
- **判断**:
  - 有効期限考慮済みビューを使用（期限切れチケット消費防止）
  - expires_at=nullで無期限チケット運用（将来の拡張性確保）
  - 予約作成・キャンセル両方でexpires_atを明示的に設定
- **成果**: HIGH優先度バグ修正完了、期限切れチケット消費リスク解消
- **技術課題**:
  - member_plansに有効期限カラムなし → 個別チケットで管理する設計と判明
  - Worktree初回作成時に親ディレクトリ間違い → 正しいリポジトリから作成し直し
- **Commit**: 01315c2
- **次**: Phase 2 - テスト環境構築（Jest + Testing Library）

**Phase 2: テスト環境構築** ✅

- **実施**: Jest 29.7.0 + React Testing Library 16.3.0セットアップ、tickets/reservations APIテスト実装（23ケース）
- **判断**:
  - `testEnvironment: 'node'`を採用（Next.js 16のWeb API互換性問題を回避）
  - Promiseライクなモック設計（メソッドチェーン + 直接await対応）
  - カバレッジ85.57%達成（目標50%を大幅超過）
  - テストディレクトリ: `src/tests/` 採用（Codex推奨の`tests/`ではなく）
- **成果**: Phase 1バグのリグレッション防止基盤確立、CI/CDレディ
- **技術課題**:
  - Supabaseモック設計: 複数の`from()`呼び出しに対応するため`mockImplementation`使用
  - Google Calendar APIエラー時の予約成功をテスト（非同期処理の独立性確認）
- **Commit**: 8d56171
- **次**: Phase 3 - ディレクトリ構成整理（Codexレビュー反映）

---

## フォーマット

各Phaseごとに以下を記録：

```
**Phase X: [タイトル]** ✅/🚧/❌

- **実施**: 何をやったか（1行）
- **判断**: 重要な方針決定（あれば）
- **成果**: 何が得られたか
- **技術課題**: ハマった点、解決策（あれば）
- **Commit**: SHA
- **次**: 次のアクション
```

**ステータス**:
- ✅ 完了
- 🚧 進行中
- ❌ 中断/保留
