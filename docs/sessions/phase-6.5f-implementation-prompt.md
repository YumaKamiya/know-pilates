# Phase 6.5f 実装プロンプト: Pricing CTA文言統一

**日本語で実施してください。**

## 目的

オーナーレビュー（Claude Opus、2025-11-28）で指摘されたMEDIUM優先度の改善項目を実施します。
Pricing セクションのCTAボタン文言を統一し、ユーザーの期待と動作を一致させます。

## 背景

**現状の問題:**
- 人気プラン: 「体験レッスンを予約」
- その他: 「詳細を見る」（→実際は予約フォームへ遷移）
- ユーザーの期待と実際の動作が不一致

**改善策:**
全て「体験レッスンを予約」または「このプランで予約」に統一

## 対象ファイル

現在、LPは未実装のため、**該当ファイルがありません**。

### 今後の対応

LPのPricingコンポーネントが実装された際に、以下の変更を適用します：

**変更前:**
```tsx
<button href="#reservation">詳細を見る</button>
```

**変更後:**
```tsx
<button href="#reservation">体験レッスンを予約</button>
```

## 実装手順

1. **現状確認**
   - LPのPricingコンポーネントが存在するか確認
   - 存在しない場合は、このPhaseをスキップ

2. **存在する場合**
   - すべてのCTAボタンの文言を「体験レッスンを予約」に統一
   - 遷移先が予約フォームであることを確認

## コミットメッセージ（実装時）

```
feat(phase-6.5f): Pricing CTA文言統一

- すべてのプランのCTAを「体験レッスンを予約」に統一
- ユーザーの期待と動作の一致、コンバージョン向上

Refs: docs/design_review_claude_20251128.md（MEDIUM優先度）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 注意事項

- 現在LPが未実装のため、このPhaseは**保留**
- LP実装時に適用すること
