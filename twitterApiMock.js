const crypto = require("crypto");

function postTweet(text, replyToTweetId, _credentials) {
	// リクエストデータを設定
	const requestData = {
		url: 'https://api.twitter.com/2/tweets',
		method: 'POST',
		data: {
			text,
			...(replyToTweetId ? { reply: { in_reply_to_tweet_id: replyToTweetId } } : {})
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
