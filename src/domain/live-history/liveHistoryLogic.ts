import { LiveHistory, SheetRow } from '@/types';
import { tryCatch } from '@/utils/errorHandler';
import { info } from '@/utils/logger';

/**
 * スプレッドシートの行データからライブ履歴情報を作成する
 * @param rows スプレッドシートの行データ
 * @returns ライブ履歴情報
 */
function makeLiveHistory(rows: SheetRow[]): LiveHistory {
  // Note: この実装は仮のものです。実際のスプレッドシートの構造に合わせて修正が必要です
  const songId = rows[0][0];
  const title = rows[0][1];

  const performances = rows.map(row => ({
    liveId: row[2],
    liveName: row[3],
    date: row[4],
    venue: row[5]
  }));

  return {
    songId,
    title,
    performances,
    performanceCount: performances.length
  };
}

/**
 * ライブ履歴情報を投稿用のテキストに変換する
 * @param liveHistory ライブ履歴情報
 * @returns 投稿用テキストの配列（複数ツイートに分割）
 */
function formatLiveHistoryPosts(liveHistory: LiveHistory): string[] {
  // Note: この実装は仮のものです。実際の要件に合わせて修正が必要です
  const posts: string[] = [];

  // 最初のツイート：曲名と上演回数
  posts.push(`『${liveHistory.title}』のライブ履歴\n上演回数：${liveHistory.performanceCount}回`);

  // 2つ目以降のツイート：ライブ履歴
  const performancesPerTweet = 3; // 1ツイートあたりの公演数
  for (let i = 0; i < liveHistory.performances.length; i += performancesPerTweet) {
    const chunk = liveHistory.performances.slice(i, i + performancesPerTweet);
    const text = chunk.map(p =>
      `${p.date} ${p.liveName}\n${p.venue}`
    ).join('\n\n');
    posts.push(text);
  }

  return posts;
}

/**
 * 指定された曲IDのライブ履歴情報を取得する
 * @param sheet スプレッドシートデータ
 * @param songId 曲ID（指定しない場合はランダム選択）
 * @returns ライブ履歴情報
 */
async function liveHistoryOf(sheet: SheetRow[], songId: string | null): Promise<LiveHistory | null> {
  return tryCatch(async () => {
    if (songId == null) {
      const randomIndex = Math.floor(Math.random() * sheet.length);
      info('ランダムな曲を選択しました', { index: randomIndex });
      // ランダムな曲のすべての履歴を取得
      const songIdSelected = sheet[randomIndex][0];
      const filteredRows = sheet.filter((row) => row[0] === songIdSelected);
      return makeLiveHistory(filteredRows);
    } else {
      const filteredRows = sheet.filter((row) => row[0] === songId);
      if (filteredRows.length === 0) {
        throw new Error(`Song with ID ${songId} not found`);
      }
      info('指定された曲IDの履歴を取得しました', { songId });
      return makeLiveHistory(filteredRows);
    }
  }, 'ライブ履歴の取得中にエラーが発生しました');
}

export { liveHistoryOf, formatLiveHistoryPosts };