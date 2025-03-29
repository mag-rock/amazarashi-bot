# ライブ履歴スプレッドシート

このディレクトリにはamazarashiのライブ履歴を管理するためのサンプルデータが含まれています。

## スプレッドシートの構造

`live-history-sheet.csv` はGoogle Spreadsheetにインポートするためのサンプルデータです。
このCSVファイルをGoogle Spreadsheetにインポートして使用してください。

### シート名: ライブ履歴

スプレッドシートには以下の列が含まれます：

| 列 | 内容 | 説明 |
|---|---|---|
| A | song_id | 曲の一意識別子 |
| B | title | 曲名 |
| C | live_id | ライブの一意識別子 |
| D | live_name | ライブ名 |
| E | date | 公演日（YYYY-MM-DD形式） |
| F | venue | 会場名 |

## スプレッドシートのセットアップ方法

1. Google Spreadsheetを新規作成する
2. シート名を「ライブ履歴」に変更する
3. メニューから「ファイル」→「インポート」を選択
4. 「アップロード」タブを選択し、`live-history-sheet.csv` をアップロード
5. インポートオプションで「現在のシートを置き換える」を選択
6. インポートをクリック

## 利用方法

このスプレッドシートは `liveHistoryScript.ts` で使用されます。
スクリプトはランダムに曲を選択して、その曲のライブ履歴をツイートします。

スプレッドシートIDは環境設定ファイルで指定する必要があります：

```typescript
// 環境設定ファイルの例
{
  "spreadsheetId": "YOUR_SPREADSHEET_ID_HERE",
  // その他の設定...
}
```

スプレッドシートIDはURLから取得できます：
`https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit` 