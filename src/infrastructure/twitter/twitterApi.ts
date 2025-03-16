import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import addOAuthInterceptor from 'axios-oauth-1.0a';

// axiosインスタンスを作成
const axiosInstance: AxiosInstance = axios.create();

// リクエストのインターセプターを設定
axiosInstance.interceptors.request.use(
	(request) => {
		console.log('=== リクエスト情報 ===');
		console.log('URL:', request.url);
		console.log('メソッド:', request.method);
		// console.log('ヘッダー:', request.headers); // ヘッダーには認証情報が含まれるため、ログに出力しない
		console.log('データ:', request.data);
		return request;
	},
	(error) => {
		console.error('リクエストエラー:', error);
		return Promise.reject(error);
	}
);

// レスポンスのインターセプターを設定
axiosInstance.interceptors.response.use(
	(response) => {
		console.log('=== レスポンス情報 ===');
		console.log('ステータスコード:', response.status);
		// console.log('ヘッダー:', response.headers); // ヘッダーには認証情報が含まれるため、ログに出力しない
		console.log('データ:', response.data);
		return response;
	},
	(error) => {
		if (error.response) {
			console.error('=== レスポンスエラー ===');
			console.error('ステータスコード:', error.response.status);
			// console.error('ヘッダー:', error.response.headers); // ヘッダーには認証情報が含まれるため、ログに出力しない
			console.error('データ:', error.response.data);
		} else {
			console.error('レスポンスエラー:', error.message);
		}
		return Promise.reject(error);
	}
);

interface TwitterCredentials {
	consumerKey: string;
	consumerSecret: string;
	accessToken: string;
	accessTokenSecret: string;
}

interface TweetRequestData {
	text: string;
	reply?: {
		in_reply_to_tweet_id: string;
	};
}

/**
 * @param text - ツイートのテキスト
 * @param replyToTweetId - リプライ対象のツイートID（オプショナル）
 * @param credentials - 認証情報
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

	return axiosInstance({
		url: 'https://api.twitter.com/2/tweets',
		method: 'POST',
		data: requestData,
		headers: { 'Content-Type': 'application/json' },
	});
} 