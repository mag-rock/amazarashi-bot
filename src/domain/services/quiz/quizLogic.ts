interface QuizPost {
	level: number;
	[key: string]: any;
}

interface QuizTemplate {
	songId: string;
	title: string;
	url: string;
	kimariji: string;
	count4: string;
	count6: string;
	count8: string;
	count10: string;
	last_quiz: string;
}

type SheetRow = [string, string, string, string, string, string, string, string, string, ...string[]];

function nextLevelOf(quizPosts: QuizPost[] | null): number {
	if (quizPosts == null || quizPosts.length === 0) {
		return 0;
	} else {
		const maxLevelQuizPost = quizPosts.reduce((prev, current) => prev.level > current.level ? prev : current);
		return maxLevelQuizPost.level + 1;
	}
}

function isFinishedTodaysQuiz(nextLevel: number): boolean {
	return nextLevel > 6;
}

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

function quizTemplateOf(sheet: any[][] | SheetRow[], songId: string | null): QuizTemplate {
	if (songId == null) {
		const randomIndex = Math.floor(Math.random() * sheet.length);
		return makeQuizTemplate(sheet[randomIndex] as SheetRow);
	} else {
		const filteredSheet = sheet.filter((row) => row[0] === songId);
		if (filteredSheet.length === 0) {
			throw new Error(`Song with ID ${songId} not found`);
		}
		return makeQuizTemplate(filteredSheet[0] as SheetRow);
	}
}

function skipNextLevel(quizTemplate: QuizTemplate, nextLevel: number): void {
	// TODO: Implement this function
}

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
	formatQuizPostText,
	QuizPost,
	QuizTemplate,
	SheetRow
}; 