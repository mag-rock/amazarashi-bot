const functions = require('@google-cloud/functions-framework');
const { postTweet } = require('./twitterApi');
const { authorize, getSheats } = require('./spreadsheatApi');
const { createDocument, readDocument, updateDocument, deleteDocument, getAllDocuments, getDocumentsCreatedBy } = require('./firestoreCrud');
const { nextLevelOf } = require('./quizLogic');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

async function allReadTest() {
	console.log(`Running on Node.js version: ${process.version}`);
	// Firestoreからドキュメントを読み取り
	const docData = await getAllDocuments('quiz');
	console.log(`docdata : ${docData}`);
}

console.log(`Running on Node.js version: ${process.version}`);

functions.http('helloHttp', async (req, res) => {
	console.log(`Request recieved.`);


	dayjs.extend(utc);
	dayjs.extend(timezone);

	const todayStr = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD');
	console.log(`Today: `, todayStr);
	const docData = await getDocumentsCreatedBy('quiz', todayStr);
	const nextLevel = nextLevelOf(docData.data);

	// Firestoreからドキュメントを読み取り
	allReadTest();

	// Spreadsheatからデータを取得
	const params = {
		spreadsheetId: '18sYgADWuSJKYeA7NiCvDaGaSLhovBiTd5KIrC9yLz8E',
		targetRange: '歌詞一覧!A2:O',
	};
	authorize()
		.then(auth => getSheats(auth, params))
		.catch(console.error);

	// ツイートするテキスト
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
