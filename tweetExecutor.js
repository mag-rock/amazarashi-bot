const { getTwitterCredentials } = require("./configLoader");
let postTweet;
if (process.env.ENVIRONMENT === 'local') {
	({ postTweet } = require('./twitterApi.js'));
} else {
	({ postTweet } = require('./twitterApi.js'));
}
const { formatQuizPostText } = require("./quizLogic");

// postTweet関数にテキストと認証情報を渡す
function executeTweet(quizTemplate, nextLevel, originPostId, todayStr) {
	const postText = formatQuizPostText(quizTemplate, todayStr, nextLevel);
	if (nextLevel === 0) {
		return postTweet(postText, null, getTwitterCredentials());
	} else {
		return postTweet(postText, originPostId, getTwitterCredentials());
	}
}

module.exports = { executeTweet };