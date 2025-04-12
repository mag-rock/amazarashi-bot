# Pull Requestのリバート方法

既存のPull Request（例：PR #13）をリバートする方法を以下にまとめます。

## 1. リバートブランチの作成

まず、リバートしたいPRの変更をもとに戻すための新しいブランチを作成します：

```bash
git checkout -b revert-pr-XX-feature-name main
```

`XX` には元のPR番号、`feature-name` にはわかりやすい機能名を入れます。

## 2. 変更のリバート

PR内容に応じて、以下のいずれかの方法でリバートします：

- **特定のディレクトリ/ファイルの削除**：
  ```bash
  git rm -r directory-name/
  ```

- **gitのrevertコマンドを使用**（PR全体をリバートする場合）：
  ```bash
  git revert -m 1 MERGE_COMMIT_HASH
  ```

## 3. 変更のコミット

リバートの変更をコミットします：

```bash
git commit -m "revert: PR #XX (機能名) をリバート"
```

## 4. ブランチのプッシュ

作成したリバートブランチをリモートにプッシュします：

```bash
git push -u origin revert-pr-XX-feature-name
```

## 5. Pull Requestの作成

### GitHub Web UIを使う場合

1. リポジトリページで「Pull requests」タブを選択
2. 「New pull request」をクリック
3. ベースブランチ（通常は `main`）とリバートブランチを選択
4. 「Create pull request」をクリック
5. タイトルと説明を入力して作成

### GitHub CLI (`gh`)を使う場合

```bash
gh pr create --title "Revert \"機能名\" (#XX)" --body "PRの説明"
```

注意：本文に改行を含める場合は [PR作成のベストプラクティス](/tips/pull-request-tips.md) を参照してください。

## 6. リバートの検証

リバート内容が正しいことを確認するには、PR前の状態との差分を確認します：

```bash
# PR #13の前のコミット(COMMIT_HASH)と現在のリバートブランチを比較
git diff COMMIT_HASH revert-pr-XX-feature-name
```

差分がない場合、リバートは成功しています。