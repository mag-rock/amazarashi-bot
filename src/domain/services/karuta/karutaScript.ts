import { authorizeGoogleApis, getSheets, SpreadsheetsParams } from '../../../infrastructure/spreadsheet/spreadsheetApi';
import { createDocument, updateDocument, getDocumentsCreatedBy } from '../../../infrastructure/database/firestoreCrud';
import { nextLevelOf, isFinishedTodaysQuiz, quizTemplateOf, QuizPost, QuizTemplate } from '../quiz/quizLogic';
import crypto from 'crypto';
import { getDayJsWithTimeZone } from '../../../infrastructure/config/configLoader';
import { executeTweet } from '../../../application/executors/tweetExecutor';

interface QuizDocument {
	id: string;
	origin_post_id: string;
	song_id: string;
	date: string;
	quiz_posts: QuizPost[];
	[key: string]: any;
}

interface TweetResponse {
	data: {
		data: {
			id: string;
			[key: string]: any;
		};
		[key: string]: any;
	};
}

async function execute(): Promise<string | void> {
	// 本日日付のクイズログを取得
	const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
	console.info(`Today: `, todayStr);
	const docData = await getDocumentsCreatedBy('quiz', todayStr) as QuizDocument[];

	// nextLevelを判定
	const nextLevel = nextLevelOf(docData[0]?.quiz_posts);
	if (isFinishedTodaysQuiz(nextLevel)) {
		console.info('本日のクイズは終了しています。');
		return 'FINISHED';
	}

	// SpreadSheetからシートを取得
	const params: SpreadsheetsParams = {
		spreadsheetId: '18sYgADWuSJKYeA7NiCvDaGaSLhovBiTd5KIrC9yLz8E',
		targetRange: '歌詞一覧!A2:J',
	};
	const googleAuth = await authorizeGoogleApis();
	const sheet = await getSheets(googleAuth, params);

	// クイズのテンプレートを作成
	const quizTemplate = quizTemplateOf(sheet as any[], docData[0]?.song_id);

	// postTweet関数にテキストと認証情報を渡す
	return executeTweet(quizTemplate, nextLevel, docData[0]?.origin_post_id, todayStr)
		.then(async (response: TweetResponse) => {
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
		});
}

export { execute }; 