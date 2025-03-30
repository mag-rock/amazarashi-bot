/**
 * 共通型定義ファイル
 * プロジェクト全体で使用される型定義を一元管理します
 */

/**
 * Twitter API認証情報
 */
export interface TwitterCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

/**
 * クイズの投稿情報
 */
export interface QuizPost {
  level: number;
  post_id: string;
  [key: string]: any;
}

/**
 * クイズのテンプレート情報
 */
export interface QuizTemplate {
  songId: string;
  title: string;
  url: string;
  kimariji: string;
  count4: string;
  count6: string;
  count8: string;
  count10: string;
  last_quiz: string;
}

/**
 * スプレッドシートの行データ型
 */
export type SheetRows = any[][];

/**
 * 曲情報のレコード型
 */
export interface SongRecord {
  songId: string;
  title: string;
  artist: string;
  album: string;
  releaseDate: string;
  playCount: number;
  setlistCountOfTour: number;
  setlistCountOfFes: number;
}

/**
 * 演奏情報のレコード型
 */
export interface PerformanceRecord {
  tourId: string; // ツアーID
  liveId: string; // ライブID
  tourType: string; // 公演種別（ツアー、フェス等）
  domestic: string; // 国内・海外
  date: string; // 日付
  liveName: string; // ツアー名
  venue: string; // 会場
  region: string; // 地域（都道府県）
  songId: string; // 曲ID
  isSetlistPublic: boolean; // セトリ解禁済
}

/**
 * Firestoreに保存されるクイズドキュメント
 */
export interface QuizDocument {
  id: string;
  origin_post_id: string;
  song_id: string;
  date: string;
  quiz_posts: QuizPost[];
  [key: string]: any;
}

/**
 * Twitter APIレスポンス
 */
export interface TweetResponse {
  data: {
    data: {
      id: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

/**
 * スプレッドシートAPI用パラメータ
 */
export interface SpreadsheetsParams {
  spreadsheetId: string;
  targetRange: string;
}

/**
 * Twitter APIリクエストデータ
 */
export interface TweetRequestData {
  text: string;
  reply?: {
    in_reply_to_tweet_id: string;
  };
}

/**
 * アプリケーション設定
 */
export interface AppConfig {
  environment: string;
  timezone: string;
  spreadsheetId: string;
  firebaseProjectId: string;
  firestoreDatabaseId: string;
}

/**
 * ライブ履歴の情報
 */
export interface LiveHistory {
  songId: string;
  title: string;
  performances: LivePerformance[];
  performanceCount: number;
  setlistCountOfTour?: number;
  setlistCountOfFes?: number;
}

/**
 * ライブ公演情報
 */
export interface LivePerformance {
  liveId: string;
  liveName: string;
  date: string;
  venue: string;
  tourId?: string;
  tourType?: string;
  domestic?: string;
  region?: string;
}

/**
 * Firestoreに保存されるライブ履歴ドキュメント
 */
export interface LiveHistoryDocument {
  id: string;
  song_id: string;
  date: string;
  tweet_posts: TweetPost[];
}

/**
 * ツイートの投稿情報
 */
export interface TweetPost {
  sequence: number;
  post_id: string;
}

export type PostTweetFunction = (
  text: string,
  replyTo: string | null,
  credentials: TwitterCredentials
) => Promise<TweetResponse>;
