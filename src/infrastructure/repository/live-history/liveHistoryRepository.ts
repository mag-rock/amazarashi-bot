import { getAppConfig } from '@/config/appConfig';
import { getDayJsWithTimeZone } from '@/infrastructure/config/configLoader';
import { createDocument, getDocumentsCreatedBy } from '@/infrastructure/database/firestoreCrud';
import { authorizeGoogleApis, getSheets } from '@/infrastructure/spreadsheet/spreadsheetApi';
import { LiveHistoryDocument, SheetRows, TweetPost, TweetResponse } from '@/types';
import { info } from '@/utils/logger';

/**
 * ライブ履歴の投稿結果をFirestoreに保存する
 * @param response Twitterのレスポンス
 * @param songId 曲ID
 * @param sequence ツイートの順番（0から始まる）
 * @param prevDoc 前回のドキュメント（続きのツイートの場合）
 * @param todayStr 今日の日付文字列
 * @returns 保存したドキュメントのID
 */
export async function saveLiveHistoryResult(
  response: TweetResponse,
  songId: string,
  sequence: number,
  prevDoc: LiveHistoryDocument | null,
  todayStr: string
): Promise<string> {
  const tweetId = response.data.data.id;

  if (prevDoc) {
    // 続きのツイートの場合は既存のドキュメントを更新
    const tweetPost: TweetPost = {
      sequence,
      post_id: tweetId,
    };
    prevDoc.tweet_posts.push(tweetPost);

    await createDocument('live_history', prevDoc.id, prevDoc);
    info('ライブ履歴ドキュメントを更新しました', { docId: prevDoc.id });
    return prevDoc.id;
  } else {
    // 最初のツイートの場合は新規ドキュメントを作成
    const doc: LiveHistoryDocument = {
      id: `${todayStr}_${songId}`,
      song_id: songId,
      date: todayStr,
      tweet_posts: [
        {
          sequence: 0,
          post_id: tweetId,
        },
      ],
    };

    await createDocument('live_history', doc.id, doc);
    info('ライブ履歴ドキュメントを作成しました', { docId: doc.id });
    return doc.id;
  }
}

/**
 * 本日のライブ履歴ドキュメントを取得する
 * @returns ライブ履歴ドキュメントの配列
 */
export async function getTodaysLiveHistory(): Promise<LiveHistoryDocument[]> {
  const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
  return (await getDocumentsCreatedBy('live_history', todayStr)) as LiveHistoryDocument[];
}

/**
 * スプレッドシートから曲一覧を取得する
 * @returns 曲一覧のデータ
 */
export async function getSongList(): Promise<SheetRows> {
  const googleAuth = await authorizeGoogleApis();
  const config = getAppConfig();
  const params = {
    spreadsheetId: config.spreadsheetId,
    targetRange: '曲一覧!A2:H' // 曲ID～セトリ入り公演数（フェスを除く）まで
  };
  
  return getSheets(googleAuth, params);
}

/**
 * 特定の曲IDに対応する演奏一覧を取得する
 * @param songId 曲ID
 * @returns 演奏一覧のデータ
 */
export async function getPerformancesForSong(songId: string): Promise<SheetRows> {
  const googleAuth = await authorizeGoogleApis();
  const config = getAppConfig();
  const params = {
    spreadsheetId: config.spreadsheetId,
    targetRange: 'ライブ演奏一覧!A2:M'
  };
  
  const data = await getSheets(googleAuth, params);
  // songIdに一致する演奏のみフィルタリング（J列=9が曲ID列）
  return data.filter(row => row[9] === songId);
}
