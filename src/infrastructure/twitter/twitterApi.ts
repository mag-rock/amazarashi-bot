import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import addOAuthInterceptor from 'axios-oauth-1.0a';
import { TwitterCredentials, TweetRequestData } from '../../types';
import { info, debug, error } from '../../utils/logger';

// axiosインスタンスを作成
const axiosInstance: AxiosInstance = axios.create();

// リクエストのインターセプターを設定
axiosInstance.interceptors.request.use(
    (request) => {
        debug('リクエスト情報', {
            url: request.url,
            method: request.method,
            data: request.data
        });
        return request;
    },
    (err) => {
        error('リクエストエラー', { message: err.message });
        return Promise.reject(err);
    }
);

// レスポンスのインターセプターを設定
axiosInstance.interceptors.response.use(
    (response) => {
        debug('レスポンス情報', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (err) => {
        if (err.response) {
            error('レスポンスエラー', {
                status: err.response.status,
                data: err.response.data
            });
        } else {
            error('ネットワークエラー', { message: err.message });
        }
        return Promise.reject(err);
    }
);

/**
 * ツイートを投稿する
 * @param text ツイートのテキスト
 * @param replyToTweetId リプライ対象のツイートID（オプショナル）
 * @param credentials 認証情報
 * @returns APIレスポンス
 */
export function postTweet(
    text: string,
    replyToTweetId: string | null,
    credentials: TwitterCredentials
): Promise<AxiosResponse> {
    const oauthOptions = {
        algorithm: 'HMAC-SHA1' as 'HMAC-SHA1',
        key: credentials.consumerKey,
        secret: credentials.consumerSecret,
        token: credentials.accessToken,
        tokenSecret: credentials.accessTokenSecret,
    };
    addOAuthInterceptor(axiosInstance, oauthOptions);

    const requestData: TweetRequestData = {
        text,
        ...(replyToTweetId ? { reply: { in_reply_to_tweet_id: replyToTweetId } } : {})
    };

    info('Twitter APIリクエストを送信します', { 
        isReply: !!replyToTweetId,
        textLength: text.length
    });

    return axiosInstance({
        url: 'https://api.twitter.com/2/tweets',
        method: 'POST',
        data: requestData,
        headers: { 'Content-Type': 'application/json' },
    });
}