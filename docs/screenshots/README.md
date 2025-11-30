# スクリーンショット管理

このディレクトリはUI/UXデザインレビュー用のスクリーンショットを保存します。

## ディレクトリ構造

```
screenshots/
├── README.md (このファイル)
├── YYYY-MM-DD/
│   ├── 01-top-page.png
│   ├── 02-member-login.png
│   ├── 03-member-dashboard.png
│   └── ...
└── YYYY-MM-DD/
    └── ...
```

## 命名規則

### 日付ディレクトリ
`YYYY-MM-DD` 形式（例: `2025-11-29`）

### スクリーンショットファイル
`{番号}-{ページ名}-{状態}.png`

**例**:
- `01-top-page.png` - トップページ
- `02-member-login.png` - 会員ログイン
- `03-member-dashboard.png` - 会員ダッシュボード
- `04-member-reservation.png` - 予約作成ページ
- `05-member-reservations.png` - 予約一覧
- `06-admin-dashboard.png` - 管理画面ダッシュボード
- `07-admin-members.png` - 管理画面会員一覧
- `08-admin-reservations.png` - 管理画面予約一覧
- `09-admin-slots.png` - 管理画面スロット管理

### デバイスサイズ
- モバイル: 375px × 812px（iPhone 13 Pro）
- デスクトップ: 1440px × 900px

## 使用目的

1. **デザインレビュー**: UI/UXの改善点特定
2. **Phase計画**: 具体的なデザイン改善タスク作成
3. **ビフォー/アフター比較**: 改善前後の比較
4. **ドキュメント**: README等で参照

## .gitignore設定

スクリーンショットファイルは`.gitignore`に追加済み：
```
docs/screenshots/**/*.png
docs/screenshots/**/*.jpg
```

## Phase 6（UI/UX洗練化）用スクショ

**撮影日**: 2025-11-29

**撮影ページ**（モバイルサイズ: 375px幅）:
1. トップページ
2. 会員ログイン
3. 会員ダッシュボード
4. 予約作成ページ
5. 予約一覧
6. 管理画面ダッシュボード
7. 管理画面会員一覧
8. 管理画面予約一覧
9. 管理画面スロット管理

**目的**: デザイン課題の特定（アイコン、間隔、フォント、カレンダーUI）
