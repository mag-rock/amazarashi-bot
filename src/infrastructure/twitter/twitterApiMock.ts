import crypto from "crypto";
import { TwitterCredentials, TweetResponse } from "../../types";
import { info } from "../../utils/logger";

/**
 * モック用のツイート投稿関数
 * 実際にAPIを呼び出さずにモックレスポンスを返す
 * @param text ツイートのテキスト
 * @param replyToTweetId リプライ対象のツイートID（オプショナル）
 * @param _credentials 認証情報（使用しない）
 * @returns モックレスポンス
 */
export function postTweet(
    text: string,
    replyToTweetId: string | null,
    _credentials: TwitterCredentials
): Promise<TweetResponse> {
    info('モックツイートを実行します', {
        text,
        replyTo: replyToTweetId
    });

    // モックレスポンスを生成
    const mockId = `mock-${crypto.randomUUID()}`;

    // Return a properly structured TweetResponse
    return Promise.resolve({
        data: {
            data: {
                id: mockId,
                text: text
            }
        }
    });
}