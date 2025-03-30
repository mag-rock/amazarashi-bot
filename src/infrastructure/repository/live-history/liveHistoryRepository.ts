import { getAppConfig } from '@/config/appConfig';
import { getDayJsWithTimeZone } from '@/infrastructure/config/configLoader';
import { createDocument, getDocumentsCreatedBy } from '@/infrastructure/database/firestoreCrud';
import { authorizeGoogleApis, getSheets } from '@/infrastructure/spreadsheet/spreadsheetApi';
import {
  LiveHistoryDocument,
  PerformanceRecord,
  SheetRows,
  SongRecord,
  TweetPost,
  TweetResponse,
} from '@/types';
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
export async function fetchSongList(): Promise<SongRecord[]> {
  const googleAuth = await authorizeGoogleApis();
  const config = getAppConfig();
  const params = {
    spreadsheetId: config.spreadsheetId,
    targetRange: '曲一覧!A2:H', // 曲ID～セトリ入り公演数（フェスを除く）まで
  };

  const sheet = await getSheets(googleAuth, params);
  return parseSheetRowsOfSongList(sheet);
}

/**
 * 特定の曲IDに対応する演奏一覧を取得する
 * @param songId 曲ID
 * @returns 演奏一覧のデータ
 */
export async function fetchPerformancesForSong(songId: string): Promise<PerformanceRecord[]> {
  const googleAuth = await authorizeGoogleApis();
  const config = getAppConfig();
  const params = {
    spreadsheetId: config.spreadsheetId,
    targetRange: 'ライブ演奏一覧!C2:O',
  };

  const sheet = await getSheets(googleAuth, params);
  const performances = parseSheetRowsOfPerformanceList(sheet);

  return performances.filter(
    (performance) => performance.songId === songId && performance.isSetlistPublic
  );
}

/**
 * スプレッドシートの曲一覧データをSongRecord型に変換する
 * @param rows スプレッドシートの行データ
 * @returns SongRecord型の配列
 */
function parseSheetRowsOfSongList(rows: SheetRows): SongRecord[] {
  return rows.map((row) => ({
    songId: row[0], // A列: 曲ID
    title: row[1], // B列: 曲名
    artist: row[2], // C列: アーティスト
    album: row[3], // D列: アルバム
    releaseDate: row[4], // E列: リリース日
    playCount: Number(row[5]), // F列: 演奏回数
    setlistCountOfTour: Number(row[6]), // G列: セトリ入り公演数（ツアー、単発）
    setlistCountOfFes: Number(row[7]), // H列: セトリ入り公演数（フェス）
  }));
}

/**
 * スプレッドシートの演奏一覧データをPerformanceRecord型に変換する
 * @param rows スプレッドシートの行データ
 * @returns PerformanceRecord型の配列
 */
function parseSheetRowsOfPerformanceList(rows: SheetRows): PerformanceRecord[] {
  return rows.map((row) => ({
    tourId: row[0], // C列-2=A列: ツアーID
    liveId: row[1], // D列-2=B列: ライブID
    date: row[3], // F列-2=D列: 日付
    liveName: row[4], // G列-2=E列: ライブ名
    venue: row[6], // I列-2=G列: 会場
    songId: row[9], // L列-2=J列: 曲ID
    isSetlistPublic: row[11] === 'TRUE', // N列-2=L列: セトリ解禁済
  }));
}
