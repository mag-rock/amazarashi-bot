const { authorizeGoogleApis, getSheats } = require('./spreadsheatApi');
const { createDocument, readDocument, updateDocument, deleteDocument, getAllDocuments, getDocumentsCreatedBy } = require('./firestoreCrud');
const { nextLevelOf, isFinishedTodaysQuiz, quizTemplateOf, formatQuizPostText } = require('./quizLogic');
const crypto = require("crypto");
const { getDayJsWithTimeZone, getTwitterCredentials } = require('./configLoader');
const { executeTweet } = require('./tweetExecutor.js');

async function execute() {

	// 本日日付のクイズログを取得
	const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
	console.info(`Today: `, todayStr);
	const docData = await getDocumentsCreatedBy('quiz', todayStr);

	// nextLevelを判定
	const nextLevel = nextLevelOf(docData[0]?.quiz_posts);
	if (isFinishedTodaysQuiz(nextLevel)) {
		console.info('本日のクイズは終了しています。');
		return;
	}

	// SpreadSheatからシートを取得
	const params = {
		spreadsheetId: '18sYgADWuSJKYeA7NiCvDaGaSLhovBiTd5KIrC9yLz8E',
		targetRange: '歌詞一覧!A2:J',
	};
	const googleAuth = await authorizeGoogleApis();
	const sheat = await getSheats(googleAuth, params);

	// クイズのテンプレートを作成
	const quizTemplate = quizTemplateOf(sheat, docData[0]?.song_id);

	// postTweet関数にテキストと認証情報を渡す
	executeTweet(quizTemplate, nextLevel, docData[0]?.origin_post_id, todayStr)
		.then(async (response) => {
			console.dir(response.data);
			if (nextLevel === 0) {
				const docId = crypto.randomUUID();
				await createDocument('quiz', docId, {
					origin_post_id: response.data.data.id,
					song_id: quizTemplate.songId,
					date: todayStr,
					quiz_posts: [{ level: 0, post_id: response.data.data.id }]
				});
			} else {
				const updatingQuizPosts = [...docData[0].quiz_posts, { level: nextLevel, post_id: response.data.data.id }];
				await updateDocument('quiz', docData[0].id, {
					quiz_posts: updatingQuizPosts
				});
			}
		})
}

exports.execute = execute;
