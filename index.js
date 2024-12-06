const functions = require('@google-cloud/functions-framework');
const OAuth = require('oauth-1.0a');
const axios = require('axios');
const crypto = require('crypto');

console.log(`Running on Node.js version: ${process.version}`);

// OAuth認証情報を設定
const consumerKey = process.env.API_KEY;
const consumerSecret = process.env.API_KEY_SECRET;
const accessToken = process.env.ACCESS_TOKEN;
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

// OAuthインスタンスを初期化
const oauth = OAuth({
	consumer: { key: consumerKey, secret: consumerSecret },
	signature_method: 'HMAC-SHA1',
	hash_function(baseString, key) {
		return crypto
			.createHmac('sha1', key)
			.update(baseString)
			.digest('base64');
	},
});

// リクエストデータを設定
const requestData = {
	url: 'https://api.twitter.com/2/tweets',
	method: 'POST',
	data: {
		text: "My First Post."
	},
};

const token = { key: accessToken, secret: accessTokenSecret };

// OAuthヘッダーを生成
const oauthHeader = oauth.toHeader(oauth.authorize(requestData, token));


functions.http('helloHttp', (req, res) => {
	const param = [
		`consumerKey: ${consumerKey.substring(0, 4)}`,
		`consumerSecret: ${consumerSecret.substring(0, 4)}`,
		`accessToken: ${accessToken.substring(0, 4)}`,
		`accessTokenSecret: ${accessTokenSecret.substring(0, 4)}`,
		`url: ${requestData.url}`,
		`method: ${requestData.method}`,
		`data: ${requestData.data}`,
	].join('\n');
	console.log(param);

	// リクエストを送信
	axios({
		url: requestData.url,
		method: requestData.method,
		data: requestData.data,
		headers: {
			...oauthHeader,
			'Content-Type': 'application/json',
		},
	})
		.then((response) => {
			console.log('ステータスコード:', response.status);
			console.log('レスポンスヘッダー:', response.headers);
			console.log('レスポンスボディ:', response.data);
			res.send(response.status + ": " + response.data);
		})
		.catch((error) => {
			console.error('リクエストエラー:', error);
			res.send(error.status + ": " + error.data);
		});
});