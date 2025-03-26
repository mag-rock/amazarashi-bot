import { getAppConfig } from '../../config/appConfig';
import {
  formatQuizPostText,
  isFinishedTodaysQuiz,
  nextLevelOf,
  quizTemplateOf,
} from '../../domain/quiz/quizLogic';
import {
  getDayJsWithTimeZone,
  getTwitterCredentials,
} from '../../infrastructure/config/configLoader';
import { getDocumentsCreatedBy } from '../../infrastructure/database/firestoreCrud';
import { saveQuizResult } from '../../infrastructure/repository/quiz/quizRepository';
import { authorizeGoogleApis, getSheets } from '../../infrastructure/spreadsheet/spreadsheetApi';
import { loadPostTweetFunction } from '../../infrastructure/twitter/twitterApiFactory';
import { QuizDocument, SpreadsheetsParams } from '../../types';
import { tryCatchRethrow } from '../../utils/errorHandler';
import { info } from '../../utils/logger';
/**
 * カルタクイズの実行メイン関数
 * @returns 実行結果
 */
export async function execute(): Promise<string | void> {
  return tryCatchRethrow(async () => {
    // 本日日付のクイズログを取得
    const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
    info(`本日の日付: ${todayStr}`);

    const docData = (await getDocumentsCreatedBy('quiz', todayStr)) as QuizDocument[];

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
    const postText = formatQuizPostText(quizTemplate, todayStr, nextLevel);

    // ツイートを実行
    const postTweet = await loadPostTweetFunction();
    const response =
      nextLevel === 0
        ? await postTweet(postText, null, getTwitterCredentials())
        : await postTweet(postText, docData[0]?.origin_post_id, getTwitterCredentials());

    // 結果を保存
    await saveQuizResult(response, quizTemplate.songId, nextLevel, docData[0], todayStr);

    return 'SUCCESS';
  }, 'カルタクイズ実行中にエラーが発生しました');
}
