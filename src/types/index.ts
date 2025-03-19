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
export type SheetRow = [string, string, string, string, string, string, string, string, string, ...string[]];

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