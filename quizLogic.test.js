const { nextLevelOf } = require('./quizLogic');

describe('nextLevelOf', () => {
	test('should return 0 if quizPosts is null', () => {
		const quizPosts = null;
		const result = nextLevelOf(quizPosts);
		expect(result).toBe(0);
	});

	test('should return 0 if quizPosts is empty', () => {
		const quizPosts = [];
		const result = nextLevelOf(quizPosts);
		expect(result).toBe(0);
	});

	test('should return the next level if quizPosts is not empty', () => {

		const quizPosts = [{ level: 0, post_id: 'value1' }, { level: 1, post_id: 'value2' }];
		const result = nextLevelOf(quizPosts);
		expect(result).toBe(2);
	});

	test('should return the next level if quizPosts has one element', () => {
		const quizPosts = [
			{ level: 5 }
		];
		const result = nextLevelOf(quizPosts);
		expect(result).toBe(6);
	});

	test('should return the next level if quizPosts has multiple elements with the same level', () => {
		const quizPosts = [
			{ level: 2 },
			{ level: 2 },
			{ level: 2 }
		];
		const result = nextLevelOf(quizPosts);
		expect(result).toBe(3);
	});
});