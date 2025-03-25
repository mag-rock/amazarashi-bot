import { TwitterCredentials, TweetResponse } from "../../types";
import { info } from "../../utils/logger";
import { useMocks } from "../../config/appConfig";

/**
 * 環境変数に基づいて適切なTwitter APIモジュールを動的にロードする
 * @returns Twitter APIのpostTweet関数
 */
export async function loadPostTweetFunction(): Promise<(
	text: string,
	replyTo: string | null,
	credentials: TwitterCredentials
) => Promise<TweetResponse>> {
	if (useMocks()) {
		info('Twitterモックを使用します');
		const module = await import('./twitterApiMock');
		return module.postTweet;
	} else {
		info('本番Twitter APIを使用します');
		const module = await import('./twitterApi');
		return module.postTweet;
	}
}
