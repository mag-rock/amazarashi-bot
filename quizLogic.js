function nextLevelOf(quizPosts) {
	if (quizPosts == null || quizPostslength === 0) {
		return 0;
	} else {
		const maxLevelQuizPost = quizPosts.reduce((prev, current) => prev.level > current.level ? prev : current);
		return maxLevelQuizPost.level + 1;
	}
}

module.exports = {
	nextLevelOf,
};