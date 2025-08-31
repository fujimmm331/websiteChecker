# FCバイエルン アウェイチケットチェッカー

FCバイエルンミュンヘンのアウェイマッチチケット販売状況を自動監視するツールです。

## 機能

- 🔍 **自動チケットチェック**: FCバイエルンのチケットサイトを定期監視
- 🎫 **アウェイマッチ専用**: Away matchesのみをチェック
- 📸 **スクリーンショット撮影**: 結果画面を自動撮影
- 🔔 **通知機能**: Slack/Discordで新チケット販売をアラート
- 📊 **結果ページ**: GitHub Pagesで結果とスクショを公開
- ⏰ **定期実行**: GitHub Actionsで1時間ごとに自動実行

## セットアップ

### 1. 依存関係インストール
```bash
npm install
npx playwright install chromium
```

### 2. 環境変数設定
```bash
cp .env.example .env
# .envファイルを編集してログイン情報を設定
```

### 3. ローカル実行
```bash
npm run check
```

## GitHub Actions設定

### 1. Secrets設定
リポジトリのSettings > Secrets and variablesで以下を設定：

- `BAYERN_USERNAME`: FCバイエルンアカウントのユーザー名
- `BAYERN_PASSWORD`: FCバイエルンアカウントのパスワード
- `SLACK_WEBHOOK_URL`: Slack通知用（オプション）
- `DISCORD_WEBHOOK_URL`: Discord通知用（オプション）

### 2. GitHub Pages有効化
Settings > Pages > Source を "GitHub Actions" に設定

## 使用方法

1. **自動実行**: 1時間ごとに自動でチケットをチェック
2. **手動実行**: GitHub ActionsのWorkflowから手動実行可能
3. **結果確認**: GitHub Pagesで結果とスクリーンショットを確認
4. **通知**: 新チケット販売時にSlack/Discordで通知

## 注意事項

⚠️ **利用規約遵守**: FCバイエルンのサイト利用規約を必ず確認してください
⚠️ **適切な間隔**: サーバー負荷を考慮して適切な間隔でアクセスしてください
⚠️ **認証情報管理**: ログイン情報は安全に管理してください