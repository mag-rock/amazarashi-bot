import crypto from "crypto";
import type { AxiosResponse } from 'axios';
import { TwitterCredentials } from "../../types";
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
): Promise<AxiosResponse> {
    info('モックツイートを実行します', {
        text,
        replyTo: replyToTweetId
    });

    // モックレスポンスを生成
    const mockId = `mock-${crypto.randomUUID()}`;
    
    // Return a properly structured AxiosResponse
    return Promise.resolve({
        status: 201,
        statusText: 'Created',
        headers: {
            'content-type': 'application/json'
        },
        data: {
            data: {
                id: mockId,
                text: text
            }
        },
        config: {
            headers: {} // Minimum required property
        }
    } as unknown as AxiosResponse);
}