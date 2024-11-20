const axios = require('axios');
const addOAuthInterceptor = require('axios-oauth-1.0a').default;

// axiosインスタンスを作成
const axiosInstance = axios.create();

// リクエストのインターセプターを設定
axiosInstance.interceptors.request.use(
	(request) => {
		console.log('=== リクエスト情報 ===');
		console.log('URL:', request.url);
		console.log('メソッド:', request.method);
		console.log('ヘッダー:', request.headers);
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
		console.log('ヘッダー:', response.headers); // ヘッダーには認証情報が含まれるため、ログに出力しない
		console.log('データ:', response.data);
		return response;
	},
	(error) => {
		if (error.response) {
			console.error('=== レスポンスエラー ===');
			console.error('ステータスコード:', error.response.status);
			console.error('ヘッダー:', error.response.headers);
			console.error('データ:', error.response.data);
		} else {
			console.error('レスポンスエラー:', error.message);
		}
		return Promise.reject(error);
	}
);

function postTweet(text, credentials) {
	// Oauthの認証処理を追加
	const oauthOptions = {
		algorithm: 'HMAC-SHA1',
		key: credentials.consumerKey,
		secret: credentials.consumerSecret,
		token: credentials.accessToken,
		tokenSecret: credentials.accessTokenSecret,
	};
	addOAuthInterceptor(axiosInstance, oauthOptions);

	// リクエストデータを設定
	const requestData = {
		url: 'https://api.twitter.com/2/tweets',
		method: 'POST',
		data: {
			text: text,
		},
	};
	// リクエストを送信
	return axiosInstance({
		url: requestData.url,
		method: requestData.method,
		data: requestData.data,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}

module.exports = { postTweet };
