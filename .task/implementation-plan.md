# ライブ履歴機能 - 最後の演奏日・ライブ名追加 実装計画

## 概要

要求仕様の変更により、ライブ履歴の最初のツイートに「最後の演奏日」と「最後の演奏ライブ名」を追加する機能を実装します。

## 変更内容

### 1. 要求仕様の変更点

**変更前の投稿形式：**
```
🎵 『{曲名}』のライブ演奏履歴

📋 セトリ採用回数
　・ツアー/単発公演：{setlistCountOfTour}回
　・フェス/対バン：{setlistCountOfFes}回

🎤 演奏回数：{performanceCount}回
```

**変更後の投稿形式：**
```
🎵 『{曲名}』のライブ演奏履歴

📋 セトリ採用回数
　・ツアー/単発公演：{setlistCountOfTour}回
　・フェス/対バン：{setlistCountOfFes}回

🎤 演奏回数：{performanceCount}回

📆 最後の演奏日：{lastPerformanceDate}
　{lastPerformanceLiveName}
```

## 実装タスク

### タスク1: 型定義の更新
**ファイル:** `src/types/index.ts`
- `LiveHistory`インターフェースに以下のフィールドを追加：
  - `lastPerformanceDate?: string`
  - `lastPerformanceLiveName?: string`

### タスク2: ビジネスロジックの更新
**ファイル:** `src/domain/live-history/liveHistoryLogic.ts`

#### 2-1: makeLiveHistory関数の更新
- 演奏履歴から最後の演奏日と最後の演奏ライブ名を取得するロジックを追加
- 演奏履歴を日付降順でソートして最新の演奏を特定
- `LiveHistory`オブジェクトに新しいフィールドを設定

#### 2-2: formatLiveHistoryPosts関数の更新
- 最初のツイートのテンプレートに最後の演奏日とライブ名を追加
- 新しい投稿形式に対応

### タスク3: テストの実装・更新
**ファイル:** `tests/domain/live-history/liveHistoryLogic.test.ts`
- 新しいフィールドが正しく設定されることを確認するテストを追加
- 既存のテストケースを新しい投稿形式に合わせて更新

## 実装詳細

### 最後の演奏日・ライブ名の取得ロジック

1. **演奏履歴のソート**
   - `performances`配列を`date`フィールドで降順ソート
   - 最新の演奏（配列の最初の要素）を取得

2. **データの抽出**
   - 最新演奏の`date`フィールドから最後の演奏日を取得
   - 最新演奏の`liveName`フィールドから最後の演奏ライブ名を取得

3. **エラーハンドリング**
   - 演奏履歴が空の場合の処理
   - 日付データが不正な場合の処理

### 投稿テキストの更新

```typescript
// 更新後のテンプレート例
let firstPost = `🎵 『${liveHistory.title}』のライブ演奏履歴\n\n`;

firstPost += `📋 セトリ採用回数\n`;
firstPost += `　・ツアー/単発公演：${liveHistory.setlistCountOfTour ?? 0}回\n`;
firstPost += `　・フェス/対バン：${liveHistory.setlistCountOfFes ?? 0}回\n\n`;

firstPost += `🎤 演奏回数：${liveHistory.performanceCount}回\n\n`;

// 新規追加部分
firstPost += `📆 最後の演奏日：${liveHistory.lastPerformanceDate}\n`;
firstPost += `　${liveHistory.lastPerformanceLiveName}`;
```

## 影響範囲

### 直接影響
- `src/types/index.ts` - 型定義の追加
- `src/domain/live-history/liveHistoryLogic.ts` - ロジックの更新
- テストファイル - テストケースの更新

### 間接影響
- 投稿されるツイートの文字数が増加するため、文字数制限への影響を確認
- 既存の投稿履歴との整合性確認

## 検証項目

1. **機能検証**
   - 最後の演奏日が正しく取得されること
   - 最後の演奏ライブ名が正しく取得されること
   - 新しい投稿形式でツイートが生成されること

2. **エッジケース検証**
   - 演奏履歴が1件のみの場合
   - 同じ日付の演奏が複数ある場合
   - 日付データが不正な場合

3. **文字数制限検証**
   - 新しい投稿形式でも280文字制限内に収まること
   - 長いライブ名の場合の動作確認

## 実装順序

1. 型定義の更新（タスク1）
2. ビジネスロジックの更新（タスク2）
3. テストの実装・更新（タスク3）
4. 動作確認・検証

## 注意事項

- 既存の機能に影響を与えないよう、後方互換性を保つ
- 演奏履歴データの品質に依存するため、データの整合性を確認
- 文字数制限を超える可能性があるため、適切なエラーハンドリングを実装 