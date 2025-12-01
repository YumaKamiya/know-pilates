# Phase 6.5g 実装プロンプト: Button asChild実装

**日本語で実施してください。**

## 目的

オーナーレビュー（Claude Opus、2025-11-28）で指摘されたLOW優先度の改善項目を実施します。
Radix UIパターンで `asChild` プロパティを実装し、Link要素を共通Buttonでラップ可能にします。

## 背景

**現状の問題:**
- `Button.tsx` に `asChild?: boolean` の型定義はあるが、実装されていない
- Hero、Pricing等のLink要素が共通Buttonを使わず、直接スタイルを記述

**改善策:**
Radix UIパターンで `asChild` を実装し、コードの保守性を向上

## 対象ファイル

### 主要対象
- `src/components/ui/Button.tsx` - asChild実装

## 実装内容

### 1. @radix-ui/react-slot のインストール

```bash
npm install @radix-ui/react-slot
```

### 2. Button.tsx の実装

**変更前:**
```tsx
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  asChild,
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
```

**変更後:**
```tsx
import { Slot } from "@radix-ui/react-slot";

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  asChild,
  className,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Comp>
  );
}
```

### 3. 使用例（今後の適用）

**Hero.tsx での使用例:**
```tsx
// 変更前
<Link href="#reservation" className="inline-flex items-center ...">
  体験レッスンを予約する
</Link>

// 変更後
<Button asChild variant="primary" size="lg">
  <Link href="#reservation">体験レッスンを予約する</Link>
</Button>
```

## 実装手順

1. **@radix-ui/react-slot のインストール**
   ```bash
   npm install @radix-ui/react-slot
   ```

2. **Button.tsx の更新**
   - `Slot` をインポート
   - `Comp` 変数で `asChild` によって要素を切り替え
   - 型定義を確認（既存の `asChild?: boolean` を活用）

3. **ビルド確認**
   ```bash
   npm run build
   ```

## テスト項目

### 1. ビルドテスト
- [ ] TypeScriptコンパイル成功
- [ ] プロダクションビルド成功

### 2. 型チェック
- [ ] `asChild` プロパティが正しく型推論される
- [ ] Button内でLinkを使用しても型エラーが出ない

## コミットメッセージ

```
feat(phase-6.5g): Button asChild実装（Radix UIパターン）

- @radix-ui/react-slot 追加
- asChild=true時にSlotコンポーネントとして動作
- Link要素を共通Buttonでラップ可能に
- コードの保守性向上、デザイン一貫性確保

Refs: docs/design_review_claude_20251128.md（LOW優先度）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 注意事項

- ✅ `origin/main` から新ブランチ作成
- ✅ 認証情報問題回避済み
- ✅ PR経由でマージ
- ⚠️ Hero, Pricing等への適用は今後のPhaseで実施（このPhaseでは基盤実装のみ）
