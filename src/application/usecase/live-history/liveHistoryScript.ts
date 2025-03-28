import {
  filterSongsWithLiveHistory,
  formatLiveHistoryPosts,
  liveHistoryOf,
  selectRandomSong,
} from '@/domain/live-history/liveHistoryLogic';
import { getDayJsWithTimeZone, getTwitterCredentials } from '@/infrastructure/config/configLoader';
import {
  getPerformancesForSong,
  getSongList,
  getTodaysLiveHistory,
  saveLiveHistoryResult,
} from '@/infrastructure/repository/live-history/liveHistoryRepository';
import { loadPostTweetFunction } from '@/infrastructure/twitter/twitterApiFactory';
import { TweetResponse } from '@/types';
import { tryCatchRethrow } from '@/utils/errorHandler';
import { info } from '@/utils/logger';

/**
 * ライブ履歴投稿の実行メイン関数
 * @returns 実行結果
 */
export async function execute(): Promise<string | void> {
  return tryCatchRethrow(async () => {
    const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
    info(`本日の日付: ${todayStr}`);

    // 既に投稿済みかチェック
    const docData = await getTodaysLiveHistory();
    if (docData.length > 0) {
      info('本日のライブ履歴は既に投稿済みです');
      return 'ALREADY_POSTED';
    }

    // 曲一覧の取得と処理
    const songList = await getSongList();
    if (!songList || songList.length === 0) {
      throw new Error('曲一覧の取得に失敗しました');
    }
    info(`曲一覧を取得しました: ${songList.length}曲`);

    // ライブ履歴がある曲の抽出と選定
    const songsWithLiveHistory = filterSongsWithLiveHistory(songList);
    if (songsWithLiveHistory.length === 0) {
      throw new Error('ライブ履歴がある曲が見つかりませんでした');
    }
    info(`ライブ履歴がある曲: ${songsWithLiveHistory.length}曲`);

    // 投稿対象曲の選定
    const selectedSong = selectRandomSong(songsWithLiveHistory);
    const songId = selectedSong[0]; // A列=0が曲ID
    const songName = selectedSong[1]; // B列=1が曲名
    info(`選定された曲: ${songName}(${songId})`);

    // 選定曲の演奏履歴取得
    const performances = await getPerformancesForSong(songId);
    if (!performances || performances.length === 0) {
      throw new Error(`選定された曲(${songId})の演奏一覧が見つかりませんでした`);
    }
    info(`演奏一覧を取得しました: ${performances.length}件`);

    // ライブ履歴テンプレート作成
    const liveHistory = await liveHistoryOf(performances, songId, selectedSong);
    if (!liveHistory) {
      throw new Error('ライブ履歴の取得に失敗しました');
    }
    const posts = formatLiveHistoryPosts(liveHistory);

    // Twitter投稿実行と結果保存
    return await publishAndSaveTweets(posts, getTwitterCredentials(), songId, docData, todayStr);
  }, 'ライブ履歴投稿実行中にエラーが発生しました');
}

/**
 * ツイートの投稿と結果保存を行う
 */
async function publishAndSaveTweets(
  posts: string[],
  credentials: any,
  songId: string,
  docData: any[],
  todayStr: string
): Promise<string> {
  const postTweet = await loadPostTweetFunction();

  let prevDocId: string | null = null;
  let prevTweetId: string | null = null;

  for (let i = 0; i < posts.length; i++) {
    const response: TweetResponse =
      i === 0
        ? await postTweet(posts[i], null, credentials)
        : await postTweet(posts[i], prevTweetId, credentials);

    const prevDoc = i === 0 ? null : docData.find((d) => d.id === prevDocId) || null;
    prevDocId = await saveLiveHistoryResult(response, songId, i, prevDoc, todayStr);
    prevTweetId = response.data.data.id;
  }

  return 'SUCCESS';
}
