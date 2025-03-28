import { TweetResponse, LiveHistoryDocument, TweetPost } from '@/types';
import { getDayJsWithTimeZone } from '@/infrastructure/config/configLoader';
import { createDocument, getDocumentsCreatedBy } from '@/infrastructure/database/firestoreCrud';
import { info } from '@/utils/logger';

/**
 * ライブ履歴の投稿結果をFirestoreに保存する
 * @param response Twitterのレスポンス
 * @param songId 曲ID
 * @param sequence ツイートの順番（0から始まる）
 * @param prevDoc 前回のドキュメント（続きのツイートの場合）
 * @param todayStr 今日の日付文字列
 * @returns 保存したドキュメントのID
 */
export async function saveLiveHistoryResult(
  response: TweetResponse,
  songId: string,
  sequence: number,
  prevDoc: LiveHistoryDocument | null,
  todayStr: string
): Promise<string> {
  const tweetId = response.data.data.id;

  if (prevDoc) {
    // 続きのツイートの場合は既存のドキュメントを更新
    const tweetPost: TweetPost = {
      sequence,
      post_id: tweetId,
    };
    prevDoc.tweet_posts.push(tweetPost);

    await createDocument('live_history', prevDoc.id, prevDoc);
    info('ライブ履歴ドキュメントを更新しました', { docId: prevDoc.id });
    return prevDoc.id;
  } else {
    // 最初のツイートの場合は新規ドキュメントを作成
    const doc: LiveHistoryDocument = {
      id: `${todayStr}_${songId}`,
      song_id: songId,
      date: todayStr,
      tweet_posts: [
        {
          sequence: 0,
          post_id: tweetId,
        },
      ],
    };

    await createDocument('live_history', doc.id, doc);
    info('ライブ履歴ドキュメントを作成しました', { docId: doc.id });
    return doc.id;
  }
}

/**
 * 本日のライブ履歴ドキュメントを取得する
 * @returns ライブ履歴ドキュメントの配列
 */
export async function getTodaysLiveHistory(): Promise<LiveHistoryDocument[]> {
  const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
  return (await getDocumentsCreatedBy('live_history', todayStr)) as LiveHistoryDocument[];
}
