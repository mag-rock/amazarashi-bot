const functions = require('@google-cloud/functions-framework');
const { postTweet } = require('./twitterApi');

console.log(`Running on Node.js version: ${process.version}`);

functions.http('helloHttp', (req, res) => {
	const text = "My First Post.";

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

	// postTweet関数にテキストと認証情報を渡す
	postTweet(text, credentials)
		.then((response) => {
			console.log('ステータスコード:', response.status);
			console.log('レスポンスヘッダー:', response.headers);
			console.log('レスポンスボディ:', response.data);
			res.send(response.status + ": " + JSON.stringify(response.data));
		})
		.catch((error) => {
			if (error.response) {
				console.error('リクエストエラー:', error.response.status, error.response.data);
				res.status(error.response.status).send(error.response.data);
			} else {
				console.error('リクエストエラー:', error.message);
				res.status(500).send('Error: ' + error.message);
			}
		});
});
