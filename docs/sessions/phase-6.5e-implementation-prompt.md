# Phase 6.5e 実装プロンプト: 体験予約フォームinputmode/autocomplete追加

**日本語で実施してください。**

## 目的

オーナーレビュー（Claude Opus、2025-11-28）で指摘されたHIGH優先度の改善項目を実施します。
50-60代女性ユーザーのスマホでの入力負荷を軽減するため、適切なキーボード表示とオートフィル対応を追加します。

## 対象ファイル

LPの体験予約フォームは現在未実装のため、**会員登録フォーム**で同様の改善を実施します。

### 主要対象
- `src/app/member/register/page.tsx` - 会員登録フォーム
- `src/app/member/register/invitation/page.tsx` - 招待経由登録フォーム

## 改善内容

### 1. autocomplete属性の追加

**対象フィールド:**
- 名前: `autocomplete="name"`
- メールアドレス: `autocomplete="email"`
- パスワード: `autocomplete="new-password"`

### 2. inputMode属性の追加

**対象フィールド:**
- メールアドレス: `inputMode="email"`（適切なキーボード表示）

### 実装例

**変更前:**
```tsx
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="..."
/>
```

**変更後:**
```tsx
<input
  type="email"
  inputMode="email"
  autoComplete="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="..."
/>
```

## 実装手順

1. **`src/app/member/register/page.tsx` の改善**
   - 名前フィールドに `autoComplete="name"` 追加
   - メールフィールドに `inputMode="email"` と `autoComplete="email"` 追加
   - パスワードフィールドに `autoComplete="new-password"` 追加

2. **`src/app/member/register/invitation/page.tsx` の改善**
   - 同様の属性を追加

## テスト項目

### 1. デスクトップブラウザ
- [ ] ビルドが正しく通る
- [ ] フォーム送信が正常に動作する

### 2. モバイルブラウザ（Chrome DevTools）
- [ ] メールフィールドでメールキーボードが表示される
- [ ] ブラウザのオートフィル機能が動作する

## コミットメッセージ

```
feat(phase-6.5e): 会員登録フォームにinputmode/autocomplete追加

- 名前フィールド: autocomplete="name"
- メールフィールド: inputMode="email", autocomplete="email"
- パスワードフィールド: autocomplete="new-password"
- 50-60代女性ユーザーのスマホ入力負荷軽減

Refs: docs/design_review_claude_20251128.md（HIGH優先度）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## 注意事項

- ✅ `origin/main` から新ブランチ作成
- ✅ 認証情報問題回避済み
- ✅ PR経由でマージ
