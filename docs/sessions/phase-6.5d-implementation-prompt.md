# Phase 6.5d 実装プロンプト: カレンダーUI全面改善

**日本語で実施してください。**

## 目的

オーナーレビュー（2025年11月28日）で指摘された改善点のうち、カレンダーUI関連の改善を実施します。

## 背景

Claude（Opus）によるUIレビュー（`docs/design_review_claude_20251128.md`）で以下の改善点が指摘されました：

1. **inputmode/autocomplete追加**（HIGH優先度）
   - ターゲットユーザー（50-60代女性）の入力負荷軽減に直結
   - スマホでの適切なキーボード表示、オートフィル対応

2. **Pricing CTA文言統一**（MEDIUM優先度）
   - UXの一貫性、コンバージョン向上

3. **Button asChild実装**（LOW優先度）
   - コードの保守性向上

## 対象ファイル

Phase 6.5dでは**会員予約カレンダーの改善**に焦点を当てます。

### 主要対象
- `src/app/member/reservation/page.tsx` - 予約カレンダーページ
- `src/components/member/MobileCalendar.tsx` - モバイルカレンダーコンポーネント

### 改善内容

#### 1. カレンダーUIの視認性向上

**現状の課題:**
- 週間カレンダーが7列で横スクロールが発生しやすい（モバイル）
- 選択中の日付が分かりにくい
- 空状態の表現が弱い

**改善策:**
- モバイルでは3日表示カレンダーを活用（既存のMobileCalendar.tsxを拡張）
- デスクトップでは7列グリッドを維持
- 選択中の日付に明確なハイライト（border-2 border-primary-500）
- 空状態に説明文を追加（「予約可能な枠がありません」）

#### 2. タッチ操作の改善

**現状の課題:**
- タップ領域は44px以上確保済み（✅）だが、フィードバックが弱い
- スワイプジェスチャー未対応

**改善策:**
- ボタンにactive状態のスタイル追加（`active:bg-primary-800`）
- カード選択時に視覚的フィードバック強化

#### 3. 週ナビゲーションの改善

**現状:**
```tsx
<button onClick={() => navigateWeek('prev')}>← 前の週</button>
```

**改善後:**
```tsx
<button
  onClick={() => navigateWeek('prev')}
  className="px-4 py-2 min-h-[44px] text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 rounded-md transition-colors"
>
  ← 前の週
</button>
```

#### 4. ステータス凡例の視認性向上

**現状:**
- 凡例が小さく見づらい

**改善策:**
- アイコンサイズを20px→24pxに拡大
- 説明文を18px（body）に統一
- 余白を広げて視認性向上

### 実装手順

1. **`src/app/member/reservation/page.tsx` の改善**
   ```tsx
   // 週ナビゲーションボタンにactive状態追加
   className="px-4 py-2 min-h-[44px] text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200 rounded-md transition-colors"

   // ステータス凡例のアイコンサイズ拡大
   <div className="w-6 h-6 bg-primary-100 rounded border border-primary-200"></div>

   // 説明文のフォントサイズ統一
   style={{ fontSize: 'var(--font-size-body)', lineHeight: 'var(--line-height-body)' }}
   ```

2. **`src/components/member/MobileCalendar.tsx` の拡張**
   - 3日表示カレンダーの視認性向上
   - 日付カードの選択状態を明確化
   - 空状態の説明文追加

3. **レスポンシブ対応の確認**
   ```tsx
   {/* モバイル: 3日表示カレンダー */}
   <div className="block md:hidden">
     <MobileCalendar ... />
   </div>

   {/* デスクトップ: 既存の7列グリッド */}
   <div className="hidden md:block">
     ...
   </div>
   ```

## テスト項目

### 1. デスクトップブラウザ
- [ ] 週ナビゲーションボタンのhover/active状態が正しく表示される
- [ ] ステータス凡例が見やすくなっている
- [ ] 7列グリッドが正しく表示される

### 2. モバイルブラウザ（Chrome DevTools）
- [ ] 3日表示カレンダーが正しく表示される
- [ ] タップ領域が44px以上確保されている
- [ ] active状態のフィードバックが表示される

### 3. 操作テスト
- [ ] 前週/次週ボタンが正しく動作する
- [ ] 日付選択が正しく動作する
- [ ] 選択中の日付が明確に分かる

## コミットメッセージ

```
feat(phase-6.5d): 会員予約カレンダーUI改善

- 週ナビゲーションボタンにactive状態追加
- ステータス凡例の視認性向上（アイコン24px、body統一）
- モバイルカレンダーの選択状態明確化
- レスポンシブ対応（モバイル3日/デスクトップ7日）

Refs: docs/design_review_claude_20251128.md
```

## PR作成コマンド

```bash
gh pr create --title "Phase 6.5d: 会員予約カレンダーUI改善" --body "$(cat <<'EOF'
## 概要
オーナーレビュー（Claude Opus）で指摘された会員予約カレンダーUIの改善を実施。

## 変更内容
- 週ナビゲーションボタンにactive状態追加（視覚的フィードバック強化）
- ステータス凡例の視認性向上（アイコン24px、フォント18px統一）
- モバイルカレンダーの選択状態明確化
- レスポンシブ対応維持（モバイル3日/デスクトップ7日）

## テスト
- [x] デスクトップブラウザで動作確認
- [x] モバイルブラウザ（Chrome DevTools）で動作確認
- [x] タップ領域44px以上確保確認

## 参考
- docs/design_review_claude_20251128.md
- Phase 6.5d実装プロンプト

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## 注意事項

### 認証情報問題の回避
- ✅ 既に `phase-6.5d-calendar-redesign` ブランチは `origin/main` から作成済み
- ✅ 認証情報を含むコミット（5a31961）は含まれていない
- ✅ PR経由でのみ `origin/main` にマージ

### Worktree管理
- メインworktreeのみ使用（クリーンアップ済み）
- 並列作業が必要な場合は新規worktree作成

### デザイントークン遵守
- カラー: CSS変数（`--color-primary-*`, `--color-neutral-*`）
- フォントサイズ: CSS変数（`--font-size-body`, `--font-size-caption`）
- タップ領域: 最低44px（`min-h-[44px]`）

## 完了条件

1. ✅ 週ナビゲーションボタンにactive状態が追加されている
2. ✅ ステータス凡例の視認性が向上している
3. ✅ モバイル/デスクトップの両方で正しく表示される
4. ✅ テスト項目がすべて通過している
5. ✅ PRが作成され、CI/CDが通過している

## 次のPhase

Phase 6.5e（予定）:
- 体験予約フォーム（LP）のinputmode/autocomplete追加
- Pricing CTA文言統一
- Button asChild実装
