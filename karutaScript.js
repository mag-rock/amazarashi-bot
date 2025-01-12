const { postTweet } = require('./twitterApiMock.js');
const { authorize, getSheats } = require('./spreadsheatApi');
const { createDocument, readDocument, updateDocument, deleteDocument, getAllDocuments, getDocumentsCreatedBy } = require('./firestoreCrud');
const { nextLevelOf, isFinishedTodaysQuiz, quizTemplateOf, makePostText } = require('./quizLogic');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const crypto = require("crypto");

async function execute() {

	// 本日日付のクイズログを取得
	dayjs.extend(utc);
	dayjs.extend(timezone);
	const todayStr = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD');
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
	const auth = await authorize();
	const sheat = await getSheats(auth, params);

	// クイズのテンプレートを作成
	const quizTemplate = quizTemplateOf(sheat, docData[0]?.song_id);

	// Postする内容を作成
	const postText = makePostText(quizTemplate, todayStr, nextLevel);

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
	postTweet(postText, credentials)
		.then(async (response) => {
			console.info('ステータスコード:', response.status);
			console.info('レスポンスヘッダー:', response.headers);
			console.info('レスポンスボディ:', response.data);
			// 投稿結果を永続化
			if (nextLevel === 0) {
				const docId = crypto.randomUUID();
				await createDocument('quiz', docId, {
					origin_post_id: response.data.id,
					song_id: quizTemplate.songId,
					date: todayStr,
					quiz_posts: [{ level: 0, post_id: response.data.id }]
				});
			} else {
				const updatingQuizPosts = [...docData[0].quiz_posts, { level: nextLevel, post_id: response.data.id }];
				await updateDocument('quiz', docData[0].id, {
					quiz_posts: updatingQuizPosts
				});
			}
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

}

exports.execute = execute;
