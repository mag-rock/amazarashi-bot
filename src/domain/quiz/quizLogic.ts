import { QuizPost, QuizTemplate, SheetRow } from '../../types';
import { info } from '../../utils/logger';
import { tryCatch } from '../../utils/errorHandler';

/**
 * 次のクイズレベルを決定する
 * @param quizPosts 現在までのクイズ投稿情報
 * @returns 次のクイズレベル
 */
function nextLevelOf(quizPosts: QuizPost[] | null): number {
    if (quizPosts == null || quizPosts.length === 0) {
        return 0;
    } else {
        const maxLevelQuizPost = quizPosts.reduce((prev, current) => prev.level > current.level ? prev : current);
        return maxLevelQuizPost.level + 1;
    }
}

/**
 * 本日のクイズが終了しているかどうかを判定する
 * @param nextLevel 次のクイズレベル
 * @returns 終了している場合はtrue、それ以外はfalse
 */
function isFinishedTodaysQuiz(nextLevel: number): boolean {
    return nextLevel > 6;
}

/**
 * スプレッドシートの行データからクイズテンプレートを作成する
 * @param row スプレッドシートの行データ
 * @returns クイズテンプレート
 */
function makeQuizTemplate(row: SheetRow): QuizTemplate {
    return {
        songId: row[0],
        title: row[1],
        url: row[2],
        kimariji: row[3],
        count4: row[4],
        count6: row[5],
        count8: row[6],
        count10: row[7],
        last_quiz: row[8],
    }
}

/**
 * 指定された曲IDまたはランダムな曲のクイズテンプレートを取得する
 * @param sheet スプレッドシートデータ
 * @param songId 曲ID（指定しない場合はランダム選択）
 * @returns クイズテンプレート
 */
function quizTemplateOf(sheet: any[][] | SheetRow[], songId: string | null): QuizTemplate {
    if (songId == null) {
        const randomIndex = Math.floor(Math.random() * sheet.length);
        info('ランダムな曲を選択しました', { index: randomIndex });
        return makeQuizTemplate(sheet[randomIndex] as SheetRow);
    } else {
        const filteredSheet = sheet.filter((row) => row[0] === songId);
        if (filteredSheet.length === 0) {
            throw new Error(`Song with ID ${songId} not found`);
        }
        info('指定された曲IDのテンプレートを取得しました', { songId });
        return makeQuizTemplate(filteredSheet[0] as SheetRow);
    }
}

/**
 * クイズの投稿テキストをフォーマットする
 * @param quizTemplate クイズテンプレート
 * @param todayStr 今日の日付文字列
 * @param nextLevel 次のクイズレベル
 * @returns フォーマットされたテキスト
 */
function formatQuizPostText(quizTemplate: QuizTemplate, todayStr: string, nextLevel: number): string {
    if (nextLevel === 0) {
        return `${todayStr}のamazarashiカルタ レベル${nextLevel} 『${quizTemplate.kimariji}』`;
    } else if (nextLevel === 1) {
        return `レベル${nextLevel} 『${quizTemplate.count4}』`;
    } else if (nextLevel === 2) {
        return `レベル${nextLevel} 『${quizTemplate.count6}』`;
    } else if (nextLevel === 3) {
        return `レベル${nextLevel} 『${quizTemplate.count8}』`;
    } else if (nextLevel === 4) {
        return `レベル${nextLevel} 『${quizTemplate.count10}』`;
    } else if (nextLevel === 5) {
        return `レベル${nextLevel} 『${quizTemplate.last_quiz}』`;
    } else {
        return ` ${quizTemplate.title} 歌詞全文：${quizTemplate.url}`;
    }
}

export {
    nextLevelOf,
    isFinishedTodaysQuiz,
    quizTemplateOf,
    formatQuizPostText
};