import { getTwitterCredentials } from "../../infrastructure/config/configLoader";
import { formatQuizPostText } from "../../domain/services/quiz/quizLogic";
import { TwitterCredentials, QuizTemplate, TweetResponse } from "../../types";
import { info } from "../../utils/logger";
import { tryCatchRethrow } from "../../utils/errorHandler";
import { useMocks } from "../../config/appConfig";
import type { AxiosResponse } from 'axios';

/**
 * Twitter APIのpostTweet関数の型定義
 */
type PostTweetFunction = (
    text: string,
    replyTo: string | null,
    credentials: TwitterCredentials
) => Promise<AxiosResponse>;

/**
 * 環境変数に基づいて適切なTwitter APIモジュールを動的にロードする
 * @returns Twitter APIのpostTweet関数
 */
async function loadTwitterModule(): Promise<PostTweetFunction> {
    if (useMocks()) {
        info('Twitterモックを使用します');
        const module = await import('../../infrastructure/twitter/twitterApiMock');
        return module.postTweet;
    } else {
        info('本番Twitter APIを使用します');
        const module = await import('../../infrastructure/twitter/twitterApi');
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
): Promise<TweetResponse> {
    return tryCatchRethrow(async () => {
        const postTweet = await loadTwitterModule();
        const postText = formatQuizPostText(quizTemplate, todayStr, nextLevel);

        info('ツイートを実行します', {
            level: nextLevel,
            isReply: nextLevel > 0,
            textLength: postText.length
        });

        if (nextLevel === 0) {
            return postTweet(postText, null, getTwitterCredentials());
        } else {
            if (!originPostId) {
                throw new Error('リプライ先の投稿IDが指定されていません');
            }
            return postTweet(postText, originPostId, getTwitterCredentials());
        }
    }, 'ツイート実行中にエラーが発生しました');
}