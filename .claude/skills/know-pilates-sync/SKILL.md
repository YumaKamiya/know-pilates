---
name: know-pilates-sync
description: know-pilatesプロジェクトの実装ログをローカルファイル（WORKLOG.md/PROGRESS.md）からNotionへ自動同期。Phase完了時の実施内容、判断、成果、技術課題をNotion実装ログページに記録し、セッション間の継続性を確保する。
---

# know-pilates Notion同期

ローカルのWORKLOG.md/PROGRESS.mdからNotionへ実装ログを自動同期し、セッション間の継続性を確保します。

## Quick Start

Phase完了時に自動的に使用：

1. **ローカルログ読込**: WORKLOG.md/PROGRESS.md を読み取り
2. **Phase抽出**: 最新のPhase情報を特定（Phase X.X、タイトル、実施内容）
3. **Notion検索**: 実装ログページを特定
4. **ページ作成**: Phase完了レポートをNotionに追加
5. **リンク更新**: 開発ハブページにリンク追加

## Workflow

### Step 1: ローカルログ読込

```
対象ファイル:
- /Users/yumakamiya/AI駆動/know-pilates/docs/WORKLOG.md
- /Users/yumakamiya/AI駆動/know-pilates/docs/PROGRESS.md

読込内容:
- 最新のPhase情報（Phase番号、タイトル、ステータス）
- 実施内容（実施、判断、成果、技術課題）
- GitコミットSHA
- 次のアクション
```

### Step 2: Phase情報の構造化

```
抽出パターン（WORKLOG.md）:

**Phase X.X: [タイトル]** ✅

- **実施**: 何をやったか
- **判断**: 重要な方針決定
- **成果**: 何が得られたか
- **技術課題**: ハマった点、解決策
- **Commit**: SHA
- **次**: 次のアクション

構造化後:
{
  "phase": "6.5d",
  "title": "カレンダーUI全面改善",
  "status": "completed",
  "implementation": "...",
  "decisions": "...",
  "achievements": "...",
  "technical_challenges": "...",
  "commit_sha": "fbb0db7",
  "next_action": "..."
}
```

### Step 3: Notion実装ログページ検索

```
Use Notion:notion-search:
query: "Claude Code 作業ページ"
query_type: "internal"

固定ページID: 39455e03-f299-46cb-8d34-19dbcd98925d
(https://www.notion.so/Claude-Code-39455e03f29946cb8d3419dbcd98925d)
```

### Step 4: Phaseレポートページ作成

```
Use Notion:notion-create-pages:

parent: { page_id: "39455e03-f299-46cb-8d34-19dbcd98925d" }

pages: [{
  properties: {
    "title": "2025-11-30 know-pilates Phase 6.5d完了 - カレンダーUI全面改善"
  },
  content: "[Phase詳細テンプレート]"
}]
```

### Step 5: 開発ハブページにリンク追加（オプション）

```
Notion:notion-update-page
page_id: "a7336c7f-be67-4fe9-827b-2a5d77cf99d1"
command: "insert_content_after"
selection_with_ellipsis: "## 📊 全体ステータス..."
new_str: "最新完了: <mention-page url='...'>Phase 6.5d - カレンダーUI改善</mention-page>"
```

## Phaseレポートテンプレート

```markdown
# Phase 6.5d: カレンダーUI全面改善

## 概要

- **Phase番号**: 6.5d
- **完了日**: 2025-11-30
- **所要時間**: 2-3時間
- **ステータス**: ✅ 完了
- **PR**: #17
- **コミット**: fbb0db7

## 実施内容

[WORKLOG.mdの「実施」セクションから抽出]

## 判断事項

[WORKLOG.mdの「判断」セクションから抽出]

主要な技術判断:
- 判断1: 理由
- 判断2: 理由

## 成果

[WORKLOG.mdの「成果」セクションから抽出]

具体的な成果物:
- 変更ファイル数
- 追加機能
- 改善されたUX

## 技術課題

[WORKLOG.mdの「技術課題」セクションから抽出]

課題と解決策:
- 課題1: 解決方法
- 課題2: 解決方法

## 次のアクション

[WORKLOG.mdの「次」セクションから抽出]

## 関連リンク

- PR: https://github.com/[repo]/pull/[number]
- 実装プロンプト: docs/sessions/phase-6.5d-implementation-prompt.md
- コミット: https://github.com/[repo]/commit/fbb0db7
```

## 同期対象Phase

以下のPhaseが未同期（2025-12-01時点）：

### Phase 6.5a: カレンダーUI全面改善 + タイポグラフィ統一
- **コミット**: adf32d4
- **PR**: #14
- **内容**: デザインシステム統一、フォントサイズCSS変数化

### Phase 6.5c: 空状態強化 + 細部調整
- **コミット**: 93104e8, ff05058
- **PR**: #13, #16
- **内容**: 管理画面ボタン不可視修正、空状態メッセージ追加

### Phase 6.5d: 会員予約カレンダーUI改善
- **コミット**: fbb0db7
- **PR**: #17
- **内容**: モバイルカレンダー改善、タッチ操作最適化

### Phase 6.5e: 会員登録フォームにinputmode/autocomplete追加
- **コミット**: 1002438
- **PR**: #18
- **内容**: スマホ入力UX改善、オートフィル対応

### Phase 6.5g: Button asChild実装
- **コミット**: bd05daa
- **PR**: #19
- **内容**: Radix UIパターン実装、コード保守性向上

## 実装パターン

### Pattern 1: 単一Phase同期

```
1. WORKLOG.mdから特定Phaseセクション抽出
2. Notion子ページ作成（実装ログページ配下）
3. 完了報告
```

### Pattern 2: 複数Phase一括同期

```
For each 未同期Phase:
  1. Phase情報抽出
  2. Notionページ作成
  3. 開発ハブに最新Phase追加

Summary:
  - 同期完了Phase一覧
  - 作成ページURL一覧
```

### Pattern 3: 差分検出＆同期

```
1. WORKLOG.md全スキャン
2. Notion実装ログページ一覧取得
3. 差分検出（タイトル比較）
4. 未同期Phaseのみ作成
```

## Best Practices

1. **日付ベースの命名**: ページタイトルに `2025-11-30` 形式の日付を含める
2. **Phase番号明示**: タイトルに必ず `Phase X.X` を含める
3. **リンク保持**: PR、コミット、実装プロンプトへのリンク必須
4. **判断の記録**: 技術的な判断理由を明記（Why優先）
5. **次アクションの継承**: Notionページに「次のアクション」セクション必須

## Common Issues

**"WORKLOGにPhase情報がない"**:
- PROGRESS.mdも確認
- Gitコミットメッセージから復元

**"Notionページ作成できない"**:
- 親ページID（39455e03-f299-46cb-8d34-19dbcd98925d）を確認
- Notion API権限を確認

**"重複作成を防ぎたい"**:
- 既存ページタイトル一覧を取得
- Phase番号で重複チェック

## Advanced Features

### 自動リンク生成

GitHubリポジトリ情報から自動的にPR/コミットURLを生成：

```
Repository: YumaKamiya/know-pilates (想定)
Commit: fbb0db7
→ https://github.com/YumaKamiya/know-pilates/commit/fbb0db7

PR: #17
→ https://github.com/YumaKamiya/know-pilates/pull/17
```

### PROGRESS.md連携

PROGRESS.mdの実装状況テーブルも同期：

```
Notion実装ログページに「実装状況サマリー」セクション追加
- 完成度パーセント
- 未実装機能一覧
- 既知の問題
```

## Examples

完全な同期例は [examples/](examples/) 参照：
- [examples/phase-6.5d-sync.md](examples/phase-6.5d-sync.md) - 単一Phase同期
- [examples/bulk-sync.md](examples/bulk-sync.md) - 複数Phase一括同期

## 参考資料

- Notion MCP API: https://github.com/makenotion/notion-sdk-js
- know-pilates WORKLOG: docs/WORKLOG.md
- know-pilates PROGRESS: docs/PROGRESS.md
- Notion実装ログ: https://www.notion.so/Claude-Code-39455e03f29946cb8d3419dbcd98925d
