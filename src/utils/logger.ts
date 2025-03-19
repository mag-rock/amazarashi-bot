/**
 * ロギングユーティリティ
 * アプリケーション全体で一貫したロギングを提供します
 */

/**
 * ログレベル
 */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR'
}

/**
 * ログエントリ
 */
interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
}

/**
 * 現在の日時を ISO 形式で取得
 */
function getTimestamp(): string {
    return new Date().toISOString();
}

/**
 * ログエントリを整形して出力
 */
function logEntry(level: LogLevel, message: string, context?: Record<string, any>): void {
    const entry: LogEntry = {
        timestamp: getTimestamp(),
        level,
        message,
        context
    };

    // 本番環境では JSON 形式でログを出力
    // 開発環境では読みやすい形式で出力
    if (process.env.ENVIRONMENT === 'production') {
        console.log(JSON.stringify(entry));
    } else {
        const contextStr = context ? ` ${JSON.stringify(context)}` : '';
        switch (level) {
            case LogLevel.DEBUG:
                console.debug(`[${entry.timestamp}] [${level}] ${message}${contextStr}`);
                break;
            case LogLevel.INFO:
                console.info(`[${entry.timestamp}] [${level}] ${message}${contextStr}`);
                break;
            case LogLevel.WARN:
                console.warn(`[${entry.timestamp}] [${level}] ${message}${contextStr}`);
                break;
            case LogLevel.ERROR:
                console.error(`[${entry.timestamp}] [${level}] ${message}${contextStr}`);
                break;
        }
    }
}

/**
 * デバッグレベルのログを出力
 */
export function debug(message: string, context?: Record<string, any>): void {
    logEntry(LogLevel.DEBUG, message, context);
}

/**
 * 情報レベルのログを出力
 */
export function info(message: string, context?: Record<string, any>): void {
    logEntry(LogLevel.INFO, message, context);
}

/**
 * 警告レベルのログを出力
 */
export function warn(message: string, context?: Record<string, any>): void {
    logEntry(LogLevel.WARN, message, context);
}

/**
 * エラーレベルのログを出力
 */
export function error(message: string, context?: Record<string, any>): void {
    logEntry(LogLevel.ERROR, message, context);
}

/**
 * エラーオブジェクトからエラーメッセージを抽出してログ出力
 */
export function logError(err: unknown, message: string = 'エラーが発生しました'): void {
    if (err instanceof Error) {
        error(message, { 
            errorMessage: err.message,
            stack: err.stack
        });
    } else {
        error(message, { error: String(err) });
    }
}