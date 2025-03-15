import { getTwitterCredentials } from "./configLoader";
import { formatQuizPostText, QuizTemplate } from "./quizLogic";
import type { AxiosResponse } from 'axios';

// 型定義
interface TwitterCredentials {
	consumerKey: string;
	consumerSecret: string;
	accessToken: string;
	accessTokenSecret: string;
}

interface TwitterAPI {
	postTweet: (text: string, replyTo: string | null, credentials: TwitterCredentials) => Promise<AxiosResponse>;
}

/**
 * 環境変数に基づいて適切なTwitter APIモジュールを動的にロードする
 * @returns Twitter APIのpostTweet関数
 */
async function loadTwitterModule(): Promise<TwitterAPI['postTweet']> {
	if (process.env.USE_TWITTER_MOCK === 'true') {
		const module = await import('./twitterApiMock');
		// Double-casting through unknown to force the type conversion
		return module.postTweet as unknown as TwitterAPI['postTweet'];
	} else {
		const module = await import('./twitterApi');
		return module.postTweet;
	}
}

/**
 * ツイートを実行する
 * @param quizTemplate クイズテンプレート
 * @param nextLevel 次のレベル
 * @param originPostId 元の投稿ID
 * @param todayStr 今日の日付文字列
 * @returns ツイート実行の結果
 */
export async function executeTweet(
	quizTemplate: QuizTemplate,
	nextLevel: number,
	originPostId: string | undefined,
	todayStr: string
): Promise<AxiosResponse> {
	const postTweet = await loadTwitterModule();
	const postText = formatQuizPostText(quizTemplate, todayStr, nextLevel);

	if (nextLevel === 0) {
		return postTweet(postText, null, getTwitterCredentials());
	} else {
		return postTweet(postText, originPostId || null, getTwitterCredentials());
	}
} 