# ユーティリティスクリプト

このディレクトリには、様々なユーティリティスクリプトが含まれています。

## extract-tweets.js

ログファイルからツイートのテキストを抽出するNode.jsスクリプトです。

### 使い方

```bash
# ファイルからツイートを抽出する
node scripts/extract-tweets.js ログファイル.txt

# 標準入力からツイートを抽出する
cat ログファイル.txt | node scripts/extract-tweets.js
```

### 機能

- ログファイルから `モックツイートを実行します` という行を検索します
- JSONデータから `text` フィールドの値を抽出します
- 抽出したテキストを `extracted-` というプレフィックスを付けた出力ファイルに書き込みます
  - 例: `log.txt` → `extracted-log.txt`
  - 標準入力の場合は `extracted-output.txt` に出力します
- 出力は区切り線で整形されます

### 出力例

```
========================================
『雨男』のライブ演奏履歴
■ツアー、単発公演のセトリ入り：6回
■フェスのセトリ入り：0回
■総演奏回数：21回
----------------------------------------
amazarashi 10th anniversary live「APOLOGIES」（2021/04/07）
amazarashi tour 2016「世界分岐二〇一六」in Taiwan & Shanghai（2016/09/23, 2016/09/25）
amazarashi 5th anniversary live tour 2016 「世界分岐二〇一六」（2016/01/17 - 2016/03/06 8回）
----------------------------------------
amazarashi 5th anniversary live 「3D edition」（2015/08/16）
amazarashi 5th anniversary live 「APOLOGIES」（2015/06/09）
amazarashi LIVE TOUR 2014「夕日信仰ヒガシズム」（2014/11/01 - 2014/12/24 8回）

========================================
『匿名希望』のライブ演奏履歴
■ツアー、単発公演のセトリ入り：1回
■フェスのセトリ入り：1回
■総演奏回数：7回
----------------------------------------
amazarashi LIVE 「あんたへ」（2014/01/11 - 2014/02/08 6回）
LIQUIDROOM 9th ANNIVERSARY presents "UNDER THE INFLUENCE"（2013/09/30）
``` 