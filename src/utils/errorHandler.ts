import { logError } from './logger';

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'UNKNOWN_ERROR',
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 非同期関数のエラーをキャッチして処理する高階関数
 * @param fn 実行する非同期関数
 * @param errorMessage エラー発生時のメッセージ
 * @returns 元の関数の戻り値またはnull（エラー時）
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'エラーが発生しました'
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    logError(err, errorMessage);
    return null;
  }
}

/**
 * 非同期関数のエラーをキャッチして処理する高階関数（エラー時に例外を再スロー）
 * @param fn 実行する非同期関数
 * @param errorMessage エラー発生時のメッセージ
 * @returns 元の関数の戻り値
 * @throws エラー発生時に例外を再スロー
 */
export async function tryCatchRethrow<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'エラーが発生しました'
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    logError(err, errorMessage);

    if (err instanceof AppError) {
      throw err;
    } else if (err instanceof Error) {
      throw new AppError(err.message, 'INTERNAL_ERROR', 500, { originalError: err.message });
    } else {
      throw new AppError(String(err), 'INTERNAL_ERROR', 500);
    }
  }
}

/**
 * 特定のエラーコードのエラーを作成する
 * @param message エラーメッセージ
 * @param details 追加の詳細情報
 * @returns AppErrorインスタンス
 */
export function createNotFoundError(message: string, details?: Record<string, any>): AppError {
  return new AppError(message, 'NOT_FOUND', 404, details);
}

/**
 * 認証エラーを作成する
 * @param message エラーメッセージ
 * @param details 追加の詳細情報
 * @returns AppErrorインスタンス
 */
export function createAuthError(message: string, details?: Record<string, any>): AppError {
  return new AppError(message, 'UNAUTHORIZED', 401, details);
}

/**
 * バリデーションエラーを作成する
 * @param message エラーメッセージ
 * @param details 追加の詳細情報
 * @returns AppErrorインスタンス
 */
export function createValidationError(message: string, details?: Record<string, any>): AppError {
  return new AppError(message, 'VALIDATION_ERROR', 400, details);
}
