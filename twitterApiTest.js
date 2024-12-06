const { postTweet } = require('./twitterApi');

// 環境変数から認証情報を取得し、オブジェクトとしてまとめる
const consumerKey = process.env.API_KEY;
const consumerSecret = process.env.API_KEY_SECRET;
const accessToken = process.env.ACCESS_TOKEN;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const credentials = {
	consumerKey,
	consumerSecret,
	accessToken,
	accessTokenSecret,
};

// テスト用のテキスト
const text = "これはテスト投稿です。";

postTweet(text, credentials)
	.then((response) => {
		console.log('ステータスコード:', response.status);
		console.log('レスポンスヘッダー:', response.headers);
		console.log('レスポンスボディ:', response.data);
	})
	.catch((error) => {
		if (error.response) {
			console.error('リクエストエラー:', error.response.status, error.response.data);
		} else {
			console.error('リクエストエラー:', error.message);
		}
	});
