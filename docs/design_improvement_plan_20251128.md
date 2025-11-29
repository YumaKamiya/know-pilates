# know-pilates デザイン改善計画

作成日: 2024-11-28

## 議論の経緯

### 当初の依頼
「Apple風の洗練されたデザインに改善したい」という依頼でスタート。

### 検討事項
50-60代のピラティススタジオ会員がターゲットであることから、Apple風デザインが本当に適切か再検討した。

#### Apple風デザインのメリット・デメリット

**メリット**
- 日本ではiPhoneユーザー率が高く、見慣れた操作感
- 洗練された印象がスタジオのブランドイメージに合う

**デメリット**
- コントラスト不足（薄いグレー、微細なシャドウは視認性が低い）
- ミニマルすぎてボタンの境界が曖昧
- アニメーションが多いと混乱する可能性
- 余白重視で1画面の情報量が減る

### 代替アプローチの検討

以下のデザインアプローチを検討：

1. **銀行・金融アプリ系** - 大きなボタン、明確なラベル、ステップバイステップ、色でステータス明示
2. **医療・ヘルスケアアプリ系** - 信頼感のある配色、空き状況の可視化
3. **和テイスト / 高級感路線** - 余白を活かした落ち着いたレイアウト、明朝体の活用
4. **LINE/Yahoo系** - 日本人に最も馴染みのあるUI

### 決定事項
「和モダン + 信頼感」アプローチを採用。

---

## 最終決定：デザインコンセプト

### 「和モダン + 信頼感」

50-60代のピラティススタジオ会員向けに、温かみがあり信頼感のあるUIを実現する。

#### デザイン方針
- **和モダン**: 既存のベージュ/テラコッタ配色を活かした落ち着いた印象
- **信頼感**: 銀行アプリのような明確なUI、丁寧な確認フロー
- **高齢者UX**: 大きなタップターゲット、明確なボタン境界、高コントラスト

---

## 現状分析

### 良い点（維持すべき点）
- Tailwind CSS v4でデザイントークン定義済み
  - Primary: ベージュ系（#faf8f5 〜 #322820）
  - Accent: テラコッタ系（#fdf5f3 〜 #401810）
  - Neutral: グレー系
- フォント: Noto Sans JP / Noto Serif JP
- 基本フォントサイズ: 18px（高齢者向け）
- 最小タップターゲット: 44px

### 問題点（改善すべき点）
- 285箇所で`gray-*`クラスを使用（デザイントークン外）
- 管理画面サイドバーが`bg-gray-900`（デザインシステム外）
- 空き状況の可視化が不十分
- 予約確認フローが簡素

---

## 実装計画

### Phase 1: 基盤 - ユーティリティ追加
**ファイル**: `/src/app/globals.css`

追加内容:
```css
/* ステータスカラー（銀行アプリ風） */
--color-success: #16a34a;  /* 緑 - 予約完了、空きあり */
--color-warning: #ca8a04;  /* 黄 - 残りわずか */
--color-error: #dc2626;    /* 赤 - 満席、エラー */

/* 控えめなトランジション */
.transition-smooth { transition: all 0.15s ease; }

/* 予約完了アニメーション */
@keyframes checkmark { ... }

/* シャドウ（信頼感のある落ち着いた影） */
.shadow-card { box-shadow: 0 2px 8px rgba(50, 40, 32, 0.08); }
.shadow-card-hover { box-shadow: 0 4px 12px rgba(50, 40, 32, 0.12); }
```

### Phase 2: UIコンポーネント強化

#### Button.tsx
- 明確な境界線（`border-2`）
- 押せる感のあるホバー（背景色変化 + 軽い影）
- disabled時のスタイル明確化

#### Card.tsx
- `shadow-card` 適用
- ホバー時は `shadow-card-hover` + 軽い上移動

### Phase 3: 予約ページ改善（優先度1）
**ファイル**: `/src/app/member/reservation/page.tsx`

改善内容:
1. **空き状況の可視化**（満席スロットも表示）
   - 空きあり: ◎ + 緑系背景（クリック可能）
   - 残りわずか: △ + 黄系背景（クリック可能）
   - 満席: × + グレーアウト（クリック不可、薄く表示）

2. **予約確認モーダルの丁寧化**
   - ステップ表示（「確認 → 完了」）
   - 変更点を明確に表示（残り回数 before/after）
   - 完了時のチェックマークアニメーション

3. **カラー統一**
   - `gray-*` → `primary-*` / `neutral-*` に置換

### Phase 4: 管理画面
- **サイドバー**: `bg-primary-900`（ウォームダーク）に統一
- **レイアウト**: `bg-primary-50`（温かみのある背景）

### Phase 5: 共有コンポーネント
- BottomNav: 軽いシャドウ追加
- フォーム入力: 統一されたスタイル

---

## カラーマッピング

### 既存カラーの置換

| 現在 | 変更後 | 用途 |
|------|--------|------|
| `gray-50/100` | `primary-50/100` | 背景、ホバー |
| `gray-200/300` | `primary-200/300` | ボーダー |
| `gray-400/500` | `neutral-400/500` | 補助テキスト |
| `gray-600/700` | `neutral-600/700` | 本文 |
| `gray-800/900` | `primary-800/900` | 見出し |

### 追加カラー（ステータス用）

| 用途 | 色 | クラス |
|------|-----|--------|
| 成功・空きあり | 緑 `#16a34a` | `text-success`, `bg-success-50` |
| 注意・残りわずか | 黄 `#ca8a04` | `text-warning`, `bg-warning-50` |
| エラー・満席 | 赤 `#dc2626` | `text-error`, `bg-error-50` |

---

## 実装順序

| 順序 | タスク | ファイル |
|------|--------|----------|
| 1 | ユーティリティ・ステータスカラー追加 | globals.css |
| 2 | Buttonコンポーネント強化 | Button.tsx |
| 3 | Cardコンポーネント強化 | Card.tsx |
| 4 | **予約ページ改善** | reservation/page.tsx |
| 5 | MobileCalendar改善 | MobileCalendar.tsx |
| 6 | AdminSidebar統一 | AdminSidebar.tsx |
| 7 | AdminLayout統一 | AdminLayout.tsx |
| 8 | 管理ダッシュボード | admin/dashboard/page.tsx |
| 9 | 会員管理ページ | admin/members/page.tsx |
| 10 | スロット管理ページ | admin/slots/page.tsx |

---

## 重要ファイル一覧

- `/src/app/globals.css` - デザイントークン、ユーティリティ
- `/src/components/ui/Button.tsx` - ボタンコンポーネント
- `/src/components/ui/Card.tsx` - カードコンポーネント
- `/src/app/member/reservation/page.tsx` - 予約ページ（最優先）
- `/src/components/member/MobileCalendar.tsx` - モバイルカレンダー
- `/src/components/admin/AdminSidebar.tsx` - 管理画面サイドバー
- `/src/components/admin/AdminLayout.tsx` - 管理画面レイアウト

---

## 補足: Claude Skills について

当初「Claude Skills」機能を活用する想定だったが、これはClaude Codeの標準機能ではないことが判明。通常のコード編集で実装を進める。
