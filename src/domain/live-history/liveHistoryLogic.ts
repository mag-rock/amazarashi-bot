import { LiveHistory, SheetRows } from '@/types';
import { tryCatch } from '@/utils/errorHandler';
import { info } from '@/utils/logger';

/**
 * スプレッドシートの行データからライブ履歴情報を作成する
 * @param rows スプレッドシートの行データ
 * @param songId 曲ID
 * @returns ライブ履歴情報
 */
function makeLiveHistory(rows: SheetRows, songId: string): LiveHistory {
  // 1行目のデータから曲名を取得
  const title = rows[0][8]; // I列(8)が曲名

  // 各行から必要な情報を抽出してパフォーマンス情報を作成
  const performances = rows.map((row) => ({
    liveId: row[1], // B列(1)がライブID
    liveName: row[4], // E列(4)がツアー名
    date: row[3], // D列(3)が日付
    venue: row[6], // G列(6)が会場
  }));

  return {
    songId,
    title,
    performances,
    performanceCount: performances.length,
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
    const text = chunk.map((p) => `${p.date} ${p.liveName}\n${p.venue}`).join('\n\n');
    posts.push(text);
  }

  return posts;
}

/**
 * 指定された曲IDのライブ履歴情報を取得する
 * @param performances 演奏データ（フィルタリング済み）
 * @param songId 曲ID
 * @returns ライブ履歴情報
 */
async function liveHistoryOf(performances: SheetRows, songId: string): Promise<LiveHistory | null> {
  return tryCatch(async () => {
    if (!performances || performances.length === 0) {
      throw new Error(`Song with ID ${songId} has no performance history`);
    }

    // フィルタリング済みの演奏データからライブ履歴を作成
    info('曲IDの演奏履歴を処理します', { songId, count: performances.length });
    return makeLiveHistory(performances, songId);
  }, 'ライブ履歴の処理中にエラーが発生しました');
}

/**
 * 曲一覧からライブ履歴がある曲をフィルタリングする
 * 演奏回数（F列=インデックス5）が0より大きい曲を抽出
 */
function filterSongsWithLiveHistory(songList: SheetRows): SheetRows {
  return songList.filter((song) => {
    // 演奏回数（F列=インデックス5）があり、0より大きい曲
    const playCount = Number(song[5]);
    return !isNaN(playCount) && playCount > 0;
  });
}

/**
 * 曲一覧からランダムに1曲を選定する
 */
function selectRandomSong(songsWithLiveHistory: SheetRows): string[] {
  const randomIndex = Math.floor(Math.random() * songsWithLiveHistory.length);
  return songsWithLiveHistory[randomIndex];
}

export { filterSongsWithLiveHistory, formatLiveHistoryPosts, liveHistoryOf, selectRandomSong };
