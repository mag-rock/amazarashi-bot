import { getAppConfig } from '@/config/appConfig';
import {
  formatLiveHistoryPosts,
  liveHistoryOf,
} from '@/domain/live-history/liveHistoryLogic';
import {
  getDayJsWithTimeZone,
  getTwitterCredentials,
} from '@/infrastructure/config/configLoader';
import {
  getTodaysLiveHistory,
  saveLiveHistoryResult,
} from '@/infrastructure/repository/live-history/liveHistoryRepository';
import { authorizeGoogleApis, getSheets } from '@/infrastructure/spreadsheet/spreadsheetApi';
import { loadPostTweetFunction } from '@/infrastructure/twitter/twitterApiFactory';
import { SpreadsheetsParams, TweetResponse } from '@/types';
import { tryCatchRethrow } from '@/utils/errorHandler';
import { info } from '@/utils/logger';

/**
 * ライブ履歴投稿の実行メイン関数
 * @returns 実行結果
 */
export async function execute(): Promise<string | void> {
  return tryCatchRethrow(async () => {
    // 本日のライブ履歴を取得
    const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
    info(`本日の日付: ${todayStr}`);

    const docData = await getTodaysLiveHistory();
    if (docData.length > 0) {
      info('本日のライブ履歴は既に投稿済みです');
      return 'ALREADY_POSTED';
    }

    // SpreadSheetからシートを取得
    const config = getAppConfig();
    const params: SpreadsheetsParams = {
      spreadsheetId: config.spreadsheetId,
      targetRange: 'ライブ履歴!A2:F', // Note: 実際のシート名とレンジに合わせて修正が必要
    };

    const googleAuth = await authorizeGoogleApis();
    const sheet = await getSheets(googleAuth, params);

    // ライブ履歴のテンプレートを作成
    const liveHistory = await liveHistoryOf(sheet as any[], null); // ランダムな曲を選択
    if (!liveHistory) {
      throw new Error('ライブ履歴の取得に失敗しました');
    }
    const posts = formatLiveHistoryPosts(liveHistory);

    // ツイートを実行
    const postTweet = await loadPostTweetFunction();
    const credentials = getTwitterCredentials();

    let prevDocId: string | null = null;
    let prevTweetId: string | null = null;
    for (let i = 0; i < posts.length; i++) {
      const response: TweetResponse = i === 0
        ? await postTweet(posts[i], null, credentials)
        : await postTweet(posts[i], prevTweetId, credentials);

      // 結果を保存
      const prevDoc = i === 0 ? null : docData.find(d => d.id === prevDocId) || null;
      prevDocId = await saveLiveHistoryResult(
        response,
        liveHistory.songId,
        i,
        prevDoc,
        todayStr
      );
      prevTweetId = response.data.data.id;
    }

    return 'SUCCESS';
  }, 'ライブ履歴投稿実行中にエラーが発生しました');
}