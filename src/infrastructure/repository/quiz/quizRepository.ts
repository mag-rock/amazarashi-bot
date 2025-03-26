import crypto from 'crypto';
import { createDocument, updateDocument } from '@/infrastructure/database/firestoreCrud';
import { QuizDocument, TweetResponse } from '@/types';
import { info } from '@/utils/logger';

/**
 * クイズ結果をFirestoreに保存する
 * @param response ツイートレスポンス
 * @param songId 曲ID
 * @param nextLevel 次のレベル
 * @param existingDoc 既存のドキュメント
 * @param todayStr 今日の日付文字列
 */
async function saveQuizResult(
  response: TweetResponse,
  songId: string,
  nextLevel: number,
  existingDoc: QuizDocument | undefined,
  todayStr: string
): Promise<void> {
  const tweetId = response.data.data.id;

  if (nextLevel === 0) {
    // 新規クイズの場合
    const docId = crypto.randomUUID();
    info('新規クイズドキュメントを作成します', { docId, tweetId });

    await createDocument('quiz', docId, {
      origin_post_id: tweetId,
      song_id: songId,
      date: todayStr,
      quiz_posts: [{ level: 0, post_id: tweetId }],
    });
  } else {
    // 既存クイズの続きの場合
    if (!existingDoc) {
      throw new Error('既存のクイズドキュメントが見つかりません');
    }

    const updatingQuizPosts = [...existingDoc.quiz_posts, { level: nextLevel, post_id: tweetId }];
    info('クイズドキュメントを更新します', {
      docId: existingDoc.id,
      postsCount: updatingQuizPosts.length,
    });

    await updateDocument('quiz', existingDoc.id, {
      quiz_posts: updatingQuizPosts,
    });
  }
}

export { saveQuizResult };
