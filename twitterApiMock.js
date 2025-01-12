const crypto = require("crypto");

function postTweet(text, credentials) {
	// リクエストデータを設定
	const requestData = {
		url: 'https://api.twitter.com/2/tweets',
		method: 'POST',
		data: {
			text: text,
		},
	};
	console.log('=== Mockリクエスト ===');
	console.dir(requestData, { depth: null });
	// リクエストを送信
	return Promise.resolve({
		status: 201,
		headers: {
			'content-type': 'application/json',
		},
		data: {
			id: `mock-${crypto.randomUUID()}`,
			text: text,
		},
	});
}

module.exports = { postTweet };
