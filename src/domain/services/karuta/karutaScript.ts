import { authorizeGoogleApis, getSheets } from '../../../infrastructure/spreadsheet/spreadsheetApi';
import { createDocument, updateDocument, getDocumentsCreatedBy } from '../../../infrastructure/database/firestoreCrud';
import { nextLevelOf, isFinishedTodaysQuiz, quizTemplateOf } from '../quiz/quizLogic';
import { executeTweet } from '../../../application/executors/tweetExecutor';
import { getDayJsWithTimeZone } from '../../../infrastructure/config/configLoader';
import { QuizDocument, TweetResponse, SpreadsheetsParams } from '../../../types';
import { info } from '../../../utils/logger';
import { tryCatchRethrow } from '../../../utils/errorHandler';
import crypto from 'crypto';
import { getAppConfig } from '../../../config/appConfig';

/**
 * カルタクイズの実行メイン関数
 * @returns 実行結果
 */
async function execute(): Promise<string | void> {
    return tryCatchRethrow(async () => {
        // 本日日付のクイズログを取得
        const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
        info(`本日の日付: ${todayStr}`);
        
        const docData = await getDocumentsCreatedBy('quiz', todayStr) as QuizDocument[];
        
        // nextLevelを判定
        const nextLevel = nextLevelOf(docData[0]?.quiz_posts);
        if (isFinishedTodaysQuiz(nextLevel)) {
            info('本日のクイズは終了しています');
            return 'FINISHED';
        }
        
        // SpreadSheetからシートを取得
        const config = getAppConfig();
        const params: SpreadsheetsParams = {
            spreadsheetId: config.spreadsheetId,
            targetRange: '歌詞一覧!A2:J',
        };
        
        const googleAuth = await authorizeGoogleApis();
        const sheet = await getSheets(googleAuth, params);
        
        // クイズのテンプレートを作成
        const quizTemplate = quizTemplateOf(sheet as any[], docData[0]?.song_id);
        
        // ツイートを実行
        info('ツイートを実行します', { level: nextLevel });
        const response = await executeTweet(quizTemplate, nextLevel, docData[0]?.origin_post_id, todayStr);
        
        // 結果を保存
        await saveQuizResult(response, quizTemplate.songId, nextLevel, docData[0], todayStr);
        
        return 'SUCCESS';
    }, 'カルタクイズ実行中にエラーが発生しました');
}

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
            quiz_posts: [{ level: 0, post_id: tweetId }]
        });
    } else {
        // 既存クイズの続きの場合
        if (!existingDoc) {
            throw new Error('既存のクイズドキュメントが見つかりません');
        }
        
        const updatingQuizPosts = [...existingDoc.quiz_posts, { level: nextLevel, post_id: tweetId }];
        info('クイズドキュメントを更新します', { 
            docId: existingDoc.id, 
            postsCount: updatingQuizPosts.length 
        });
        
        await updateDocument('quiz', existingDoc.id, {
            quiz_posts: updatingQuizPosts
        });
    }
}

export { execute };