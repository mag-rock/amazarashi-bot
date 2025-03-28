import { formatLiveHistoryPosts, liveHistoryOf } from '@/domain/live-history/liveHistoryLogic';
import { getDayJsWithTimeZone, getTwitterCredentials } from '@/infrastructure/config/configLoader';
import {
  getPerformancesForSong,
  getSongList,
  getTodaysLiveHistory,
  saveLiveHistoryResult
} from '@/infrastructure/repository/live-history/liveHistoryRepository';
import { loadPostTweetFunction } from '@/infrastructure/twitter/twitterApiFactory';
import { SheetRows, TweetResponse } from '@/types';
import { tryCatchRethrow } from '@/utils/errorHandler';
import { info } from '@/utils/logger';

/**
 * ライブ履歴投稿の実行メイン関数
 * @returns 実行結果
 */
export async function execute(): Promise<string | void> {
  return tryCatchRethrow(async () => {
    // 1. 日付の取得とスキップ判定
    const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
    info(`本日の日付: ${todayStr}`);

    const docData = await getTodaysLiveHistory();
    if (docData.length > 0) {
      info('本日のライブ履歴は既に投稿済みです');
      return 'ALREADY_POSTED';
    }

    // 2. スプレッドシートから「曲一覧」を取得
    const songList = await getSongList();
    if (!songList || songList.length === 0) {
      throw new Error('曲一覧の取得に失敗しました');
    }
    info(`曲一覧を取得しました: ${songList.length}曲`);

    // 3. 「ライブ履歴がある曲一覧」を取得（ドメインロジックで対応する前提）
    const songsWithLiveHistory = filterSongsWithLiveHistory(songList);
    if (songsWithLiveHistory.length === 0) {
      throw new Error('ライブ履歴がある曲が見つかりませんでした');
    }
    info(`ライブ履歴がある曲: ${songsWithLiveHistory.length}曲`);

    // 4. ランダムに1曲を選定
    const selectedSong = selectRandomSong(songsWithLiveHistory);
    const songId = selectedSong[0]; // A列=0がsongIdと仮定
    info(`選定された曲: ${songId}`);

    // 5. 選定された曲に合致する演奏一覧を取得
    const performances = await getPerformancesForSong(songId);
    if (!performances || performances.length === 0) {
      throw new Error(`選定された曲(${songId})の演奏一覧が見つかりませんでした`);
    }
    info(`演奏一覧を取得しました: ${performances.length}件`);

    // 6. ライブ履歴のテンプレートを作成
    const liveHistory = await liveHistoryOf(performances, songId);
    if (!liveHistory) {
      throw new Error('ライブ履歴の取得に失敗しました');
    }
    const posts = formatLiveHistoryPosts(liveHistory);

    // 7. ツイートを実行
    const postTweet = await loadPostTweetFunction();
    const credentials = getTwitterCredentials();

    let prevDocId: string | null = null;
    let prevTweetId: string | null = null;
    
    // 8. 結果の保存
    for (let i = 0; i < posts.length; i++) {
      const response: TweetResponse =
        i === 0
          ? await postTweet(posts[i], null, credentials)
          : await postTweet(posts[i], prevTweetId, credentials);

      const prevDoc = i === 0 ? null : docData.find((d) => d.id === prevDocId) || null;
      prevDocId = await saveLiveHistoryResult(response, liveHistory.songId, i, prevDoc, todayStr);
      prevTweetId = response.data.data.id;
    }

    return 'SUCCESS';
  }, 'ライブ履歴投稿実行中にエラーが発生しました');
}

/**
 * 曲一覧からライブ履歴がある曲をフィルタリングする
 * @param songList 曲一覧
 * @returns ライブ履歴がある曲の一覧
 */
function filterSongsWithLiveHistory(songList: SheetRows): SheetRows {
  // 仮実装：本来はドメインロジックでライブ履歴がある曲を判定
  // B列(1)に「true」または何らかの値があれば、ライブ履歴ありと仮定
  return songList.filter(song => song[1] && song[1].toString().trim() !== '');
}

/**
 * 曲一覧からランダムに1曲を選定する
 * @param songsWithLiveHistory ライブ履歴がある曲一覧
 * @returns ランダムに選定された1曲
 */
function selectRandomSong(songsWithLiveHistory: SheetRows): string[] {
  const randomIndex = Math.floor(Math.random() * songsWithLiveHistory.length);
  return songsWithLiveHistory[randomIndex];
}
