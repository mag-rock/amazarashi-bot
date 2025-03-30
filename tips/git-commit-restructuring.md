# Gitコミット履歴整理チートシート

このチートシートでは、既存のコミット履歴を整理して、より読みやすく論理的なコミット履歴に再構成する方法を説明する。

## 目的

コミット履歴を整理する主な目的：
- 機能ごとにコミットを分割し、レビューしやすくする
- 論理的な依存関係に基づいてコミットを並び替える
- 不要なコミット（空コミットなど）を削除する
- より分かりやすいコミットメッセージにする

## 基本的な手順

### 1. 現在の状態をバックアップ

```bash
# 現在のブランチの状態をバックアップブランチとして保存
git branch backup/[元ブランチ名]
```

### 2. 新しいブランチの作成

```bash
# メインブランチから新しいブランチを作成
git checkout main
git checkout -b feature/[新ブランチ名]
```

### 3. 変更内容を作業ディレクトリに展開

```bash
# バックアップブランチの変更をマージするが、コミットはしない
git merge --no-commit --no-ff backup/[元ブランチ名]

# コミットはせずに、変更を作業ディレクトリに残す
git reset
```

### 4. 機能単位でステージングとコミット

```bash
# 機能Aに関連するファイルをステージング
git add ファイルパスA1 ファイルパスA2 ...
git commit -m "feat: 機能Aの実装"

# 機能Bに関連するファイルをステージング
git add ファイルパスB1 ファイルパスB2 ...
git commit -m "feat: 機能Bの実装"

# 以下同様
```

## 応用テクニック

### コミットの順序を依存関係に基づいて決定

コミットの順序は、コードの依存関係に基づいて決定する

1. **基盤となる変更**：他の変更が依存する基本的な変更を最初にコミット
   ```bash
   git add package.json 設定ファイル類 ...
   git commit -m "chore: 依存関係と設定ファイルの更新"
   ```

2. **機能のコア部分**：機能の中心となる実装
   ```bash
   git add src/core/ src/models/ ...
   git commit -m "feat: コア機能の実装"
   ```

3. **UI層や周辺機能**：コア機能に依存する部分
   ```bash
   git add src/views/ src/components/ ...
   git commit -m "feat: UI実装"
   ```

### インタラクティブリベースで既存コミットを整理

```bash
# 直近3つのコミットを整理
git rebase -i HEAD~3

# 特定のコミットから現在までを整理
git rebase -i [コミットハッシュ]
```

リベースエディタで以下の操作が可能：
- `pick`：コミットをそのまま使用
- `reword`：コミットメッセージを変更
- `edit`：コミット内容を編集
- `squash`：前のコミットと統合（メッセージも統合）
- `fixup`：前のコミットと統合（メッセージは破棄）
- `drop`：コミットを削除

### 特定のコミットだけを削除

```bash
# インタラクティブリベースでコミットを削除
git rebase -i [削除したいコミットの1つ前のハッシュ]
```

エディタで削除したいコミットの行の`pick`を`drop`に変更する。

## 実践例

以下は実際の作業例：

```bash
# 状態をバックアップ
git branch backup/featrue-cloudbuild

# メインから新ブランチを作成
git checkout main
git checkout -b feature/deploy-setup

# 変更を作業ディレクトリに展開
git merge --no-commit --no-ff backup/featrue-cloudbuild
git reset

# 依存関係を考慮したコミット
# 1. アプリケーション構成（基盤）
git add package.json package-lock.json src/index.ts
git commit -m "feat: アプリケーション構成とHTTP関数を整理"

# 2. インフラ設定（アプリ構成に依存）
git add infra/
git commit -m "feat: Cloud Build設定ファイルを追加"

# 3. 機能的な改善（最後）
git add src/domain/live-history/liveHistoryLogic.ts
git commit -m "feat: ライブ履歴の表示フォーマットを改善"
```

## 注意点

- バックアップブランチを作成してから作業を始めることが重要
- コミットする前に `git diff --staged` で変更内容を確認する
- 機能的に関連するファイルを同じコミットにまとめる
- コミットメッセージは具体的かつ簡潔に書く
- プッシュ済みのブランチに対してリベースを行うと、他の開発者に影響するので注意が必要

## 参考資料

- [Pro Git - 歴史の書き換え](https://git-scm.com/book/ja/v2/Git-%E3%81%AE%E3%81%95%E3%81%BE%E3%81%96%E3%81%BE%E3%81%AA%E3%83%84%E3%83%BC%E3%83%AB-%E6%AD%B4%E5%8F%B2%E3%81%AE%E6%9B%B8%E3%81%8D%E6%8F%9B%E3%81%88)
- [Gitコミットの整理（英語）](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History) 