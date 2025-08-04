# amazarashi-bot

amazarashiに関する情報をツイートする自動化ボットのプロジェクトです。カルタクイズやライブ履歴など、ファンのためのコンテンツを定期的に配信します。

## 機能

このボットは以下の機能を提供します：

1. **カルタクイズ** - amazarashiの曲の歌詞を用いたクイズをツイート
2. **ライブ履歴** - 過去のライブでの演奏曲の履歴情報をツイート
3. **ヘルスチェック** - アプリケーションの稼働状況を確認するためのエンドポイント

## システム構成

このプロジェクトは以下の技術スタックで構築されています：

- **言語**: TypeScript
- **インフラ**: Google Cloud Functions
- **データベース**: Firestore
- **外部API**: Twitter API、Google Sheets API
- **テストフレームワーク**: Jest

## プロジェクト構成

```
amazarashi-bot/
├── src/                     # ソースコード
│   ├── application/         # アプリケーションレイヤー
│   │   └── usecase/         # ユースケース実装
│   ├── domain/              # ドメインレイヤー
│   │   ├── live-history/    # ライブ履歴関連のドメインロジック
│   │   └── quiz/            # クイズ関連のドメインロジック
│   ├── infrastructure/      # インフラレイヤー
│   │   ├── config/          # 設定関連
│   │   ├── database/        # データベース関連
│   │   ├── repository/      # リポジトリ実装
│   │   ├── spreadsheet/     # スプレッドシート関連
│   │   └── twitter/         # Twitter API関連
│   ├── types/               # 型定義
│   └── utils/               # ユーティリティ
├── tests/                   # テストコード
│   ├── integration/         # 統合テスト
│   └── unit/                # ユニットテスト
├── analyze/                 # 分析スクリプト
├── infra/                   # インフラ設定
│   └── cloudbuild/          # Cloud Buildの設定
├── sample-data/             # サンプルデータ
└── scripts/                 # ユーティリティスクリプト
```

## 主要な機能の説明

### カルタクイズ機能

amazarashiの楽曲から歌詞を引用したクイズをツイートします。クイズは日ごとに決められたレベルで進行し、同日の前回投稿に対するリプライ形式で続きます。Google Spreadsheetから歌詞データを取得し、Firestoreに投稿履歴を保存します。

### ライブ履歴機能

amazarashiの過去のライブパフォーマンスから、曲のライブ演奏履歴をツイートします。ランダムに選択された曲について、いつどのライブで演奏されたかの情報をスレッド形式で投稿します。

## セットアップ方法

1. 必要なパッケージをインストール:
   ```
   npm install
   ```

2. 環境変数の設定:
   - Twitter API認証情報
   - Google Cloud認証情報
   - Spreadsheetのファイルキー

3. ローカルでの実行:
   ```
   npm run start              # デフォルト(ライブ履歴)機能を実行
   npm run start:karuta       # カルタクイズ機能を実行
   npm run start:liveHistory  # ライブ履歴機能を実行
   npm run start:health       # ヘルスチェック機能を実行
   ```

## テスト実行方法

```
npm run test        # すべてのテストを実行
npm run test:unit   # ユニットテストのみ実行
npm run test:karuta # カルタクイズのテストを実行
npm run test:live-history # ライブ履歴のテストを実行
```

## ビルドとデプロイ

```
npm run build   # TypeScriptコードをビルド
```

デプロイはGoogle Cloud Buildを使用して自動化されています。`infra/cloudbuild/`ディレクトリに設定ファイルがあります。

## 開発者向け情報

- コード整形: `npm run format`
- リント: `npm run lint`
- インポートパス変換: `npm run convert-imports`
