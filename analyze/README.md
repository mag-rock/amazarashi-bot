# PR分析ツール

このツールは、GitHubのPull Request（PR）の分析を行うPythonスクリプトです。PRの統計情報を収集し、分析結果をMarkdownファイルとグラフとして出力します。

## 機能

- PRデータの自動収集（GitHub CLIを使用）
- 以下の統計情報の分析
  - 月ごとのPR数
  - 平均レビュー時間
  - 平均コメント数
  - 平均レビュー数
  - 平均変更行数
  - 作成者ごとの統計
- 分析結果の出力
  - Markdownファイル（pr_analysis.md）
  - グラフ（pr_analysis.png）
- 改善提案の自動生成

## 必要条件

- Python 3.6以上
- GitHub CLI（gh）

## インストール

1. 必要なPythonパッケージをインストールします：

```bash
pip3 install -r requirements.txt
```

2. GitHub CLIがインストールされていない場合は、インストールします：

```bash
# Windowsの場合
winget install --id GitHub.cli

# その他のOSの場合は、GitHub CLIの公式ドキュメントを参照してください
# https://github.com/cli/cli#installation
```

3. GitHub CLIで認証を行います：

```bash
gh auth login
```

## 使用方法

1. スクリプトを実行します：

```bash
python3 pr_analyzer.py
```

2. 分析結果は以下のファイルに出力されます：
   - `pr_analysis.md`: 詳細な分析結果（Markdown形式）
   - `pr_analysis.png`: 統計情報のグラフ

## 出力例

### Markdownファイル（pr_analysis.md）

分析結果は以下のような形式で出力されます：

```markdown
# PR分析結果

## 概要
- 分析対象PR数: XX件
- 分析期間: YYYY-MM から YYYY-MM

## 月ごとの統計
- PR数
- 平均レビュー時間
- 平均コメント数
- 平均レビュー数
- 平均変更行数

## 作成者ごとの統計
- PR数
- 平均レビュー時間

## 分析結果からの提案
- レビュープロセスの活性化
- PRの大きさ
- レビュワーの多様性
```

### グラフ（pr_analysis.png）

以下の統計情報をグラフで表示します：
- 月ごとのPR数
- 月ごとの平均レビュー時間
- 月ごとの平均コメント数
- 月ごとの平均レビュー数
- 作成者ごとのPR数
- 作成者ごとの平均レビュー時間

## ライセンス

MIT License 