function nextLevelOf(quizPosts) {
	if (quizPosts == null || quizPosts.length === 0) {
		return 0;
	} else {
		const maxLevelQuizPost = quizPosts.reduce((prev, current) => prev.level > current.level ? prev : current);
		return maxLevelQuizPost.level + 1;
	}
}

function isFinishedTodaysQuiz(nextLevel) {
	return nextLevel > 7;
}

function makeQuizTemplate(row) {
	return {
		songId: row[0],
		title: row[1],
		url: row[2],
		kimariji: row[3],
		count4: row[4],
		count6: row[5],
		count8: row[6],
		count10: row[7],
		count10_kanji: row[8],
		last_quiz: row[9],
	}
}

function quizTemplateOf(sheat, songId) {
	if (songId == null) {
		const randomIndex = Math.floor(Math.random() * sheat.length);
		return makeQuizTemplate(sheat[randomIndex])
	} else {
		return makeQuizTemplate(sheat.filter((row) => row[0] === songId)[0])
	}
}

function formatQuizPostText(quizTemplate, todayStr, nextLevel) {
	if (nextLevel === 0) {
		return `${todayStr}のamazarashiカルタ レベル${nextLevel} 「${quizTemplate.kimariji}」`;
	} else if (nextLevel === 1) {
		return `レベル${nextLevel} 「${quizTemplate.count4}」`;
	} else if (nextLevel === 2) {
		return `レベル${nextLevel} 「${quizTemplate.count6}」`;
	} else if (nextLevel === 3) {
		return `レベル${nextLevel} 「${quizTemplate.count8}」`;
	} else if (nextLevel === 4) {
		return `レベル${nextLevel} 「${quizTemplate.count10}」`;
	} else if (nextLevel === 5) {
		return `レベル${nextLevel} 「${quizTemplate.count10_kanji}」`;
	} else if (nextLevel === 6) {
		return `レベル${nextLevel} 「${quizTemplate.last_quiz}」`;
	} else {
		return ` ${quizTemplate.title} 歌詞全文：${quizTemplate.url}`;
	}

}

module.exports = {
	nextLevelOf,
	isFinishedTodaysQuiz,
	quizTemplateOf,
	formatQuizPostText,
};