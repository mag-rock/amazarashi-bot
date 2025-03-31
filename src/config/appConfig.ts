import { AppConfig } from '@/types';

/**
 * アプリケーション設定を取得する
 * 環境変数から設定値を読み込み、デフォルト値とマージする
 * @returns アプリケーション設定オブジェクト
 */
export function getAppConfig(): AppConfig {
  return {
    environment: process.env.ENVIRONMENT || 'production',
    timezone: process.env.TIMEZONE || 'Asia/Tokyo',
    spreadsheetId: process.env.SPREADSHEET_ID || '18sYgADWuSJKYeA7NiCvDaGaSLhovBiTd5KIrC9yLz8E',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
    firestoreDatabaseId: process.env.FIRESTORE_DATABASE_ID || '',
  };
}

/**
 * 現在の環境がローカル開発環境かどうかを判定する
 * @returns ローカル環境の場合はtrue、それ以外はfalse
 */
export function isLocalEnvironment(): boolean {
  return getAppConfig().environment === 'local';
}

/**
 * モックを使用するかどうかを判定する
 * @returns モックを使用する場合はtrue、それ以外はfalse
 */
export function useMocks(): boolean {
  return process.env.USE_TWITTER_MOCK === 'true';
}
