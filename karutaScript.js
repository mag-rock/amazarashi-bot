const { postTweet } = require('./twitterApi');
const { authorize, getSheats } = require('./spreadsheatApi');
const { createDocument, readDocument, updateDocument, deleteDocument, getAllDocuments, getDocumentsCreatedBy } = require('./firestoreCrud');
const { nextLevelOf } = require('./quizLogic');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const crypto = require("crypto");
console.info(crypto.randomUUID());


async function execute() {
	dayjs.extend(utc);
	dayjs.extend(timezone);

	// 現在日付を取得
	const todayStr = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD');
	console.info(`Today: `, todayStr);

	const docData = await getDocumentsCreatedBy('quiz', todayStr);
	const nextLevel = nextLevelOf(docData.data);

	// Postする内容を作成
	const randomText = crypto.randomUUID();
	const postText = `${todayStr} レベル${nextLevel} ${randomText}`;
	console.info(`Post text: ${postText}`);

	// Firestoreにドキュメントを作成
	if (nextLevel === 0) {
		await createDocument('quiz', todayStr, {
			origin_post_id: 'value1',
			date: '2023-10-15',
			quiz_posts: [{ level: 0, post_id: 'value1' }]
		});
		console.info(`Document created.`);
	}


	// Spreadsheatからデータを取得
	const params = {
		spreadsheetId: '18sYgADWuSJKYeA7NiCvDaGaSLhovBiTd5KIrC9yLz8E',
		targetRange: '歌詞一覧!A2:O',
	};
	// authorize()
	// 	.then(auth => getSheats(auth, params))
	// 	.catch(console.error);

	const auth = await authorize();
	const sheat = await getSheats(auth, params);


	// const rows = sheat;
	// rows.forEach((row) => {
	// 	rowlogText = "";
	// 	row.forEach((cell) => rowlogText += cell + ", ")
	// 	// Print columns A and E, which correspond to indices 0 and 4.
	// 	console.log(rowlogText);
	// });


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
				const docId = randomText;
				await createDocument('quiz', docId, {
					origin_post_id: response.data.data.id,
					date: todayStr,
					quiz_posts: [{ level: 0, post_id: response.data.data.id }]
				});
			} else {
				await updateDocument('quiz', docData.data[0].id, {
					quiz_posts: docData.data[0].push({ level: nextLevel, post_id: response.data.data.id })
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