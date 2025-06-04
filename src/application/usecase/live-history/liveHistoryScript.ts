import {
  filterSongsWithLiveHistory,
  formatLiveHistoryPosts,
  liveHistoryOf,
  selectRandomSong,
} from '@/domain/live-history/liveHistoryLogic';
import { getDayJsWithTimeZone, getTwitterCredentials } from '@/infrastructure/config/configLoader';
import {
  fetchPerformancesForSong,
  fetchSongList,
  getTodaysLiveHistory,
  saveLiveHistoryResult,
} from '@/infrastructure/repository/live-history/liveHistoryRepository';
import { loadPostTweetFunction } from '@/infrastructure/twitter/twitterApiFactory';
import { TweetResponse, LiveHistoryDocument } from '@/types';
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
    // if (docData.length > 0) {
    //   info('本日のライブ履歴は既に投稿済みです');
    //   return 'ALREADY_POSTED';
    // }

    // 曲一覧の取得と処理
    const songList = await fetchSongList();
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
    info(`選定された曲: ${selectedSong.title}(${selectedSong.songId})`);

    // 選定曲の演奏履歴取得
    const performances = await fetchPerformancesForSong(selectedSong.songId);
    if (!performances || performances.length === 0) {
      throw new Error(`選定された曲(${selectedSong.songId})の演奏一覧が見つかりませんでした`);
    }
    info(`演奏一覧を取得しました: ${performances.length}件`);

    // ライブ履歴テンプレート作成
    const liveHistory = await liveHistoryOf(performances, selectedSong.songId, selectedSong);
    if (!liveHistory) {
      throw new Error('ライブ履歴の取得に失敗しました');
    }
    const posts = formatLiveHistoryPosts(liveHistory);

    // Twitter投稿実行と結果保存
    return await publishAndSaveTweets(
      posts,
      getTwitterCredentials(),
      selectedSong.songId,
      docData,
      todayStr
    );
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

  let prevDoc: LiveHistoryDocument | null =
    (docData.find((d) => d.song_id === songId) as LiveHistoryDocument) || null;
  let prevTweetId: string | null =
    prevDoc && prevDoc.tweet_posts.length > 0
      ? prevDoc.tweet_posts[prevDoc.tweet_posts.length - 1].post_id
      : null;

  for (let i = 0; i < posts.length; i++) {
    const response: TweetResponse =
      prevTweetId === null && i === 0
        ? await postTweet(posts[i], null, credentials)
        : await postTweet(posts[i], prevTweetId, credentials);

    prevDoc = await saveLiveHistoryResult(response, songId, i, prevDoc, todayStr);
    prevTweetId = response.data.data.id;
  }

  return 'SUCCESS';
}
