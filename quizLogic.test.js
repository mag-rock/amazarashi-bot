const { nextLevelOf, quizTemplateOf } = require('./quizLogic');

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

describe('quizTemplateOf', () => {
	const testSetSheat = [
		[
			"295471",
			"東京 acoustic version",
			"https://www.uta-net.com/song/295471/",
			"ああ",
			"ああすべ",
			"ああすべてみ",
			"ああすべてみない",
			"ああすべてみないよ",
			"ああ 全て見ないように",
		],
		[
			"282743",
			"抒情死",
			"https://www.uta-net.com/song/282743/",
			"あいで",
			"あいでん",
			"あいでんてぃ",
			"あいでんてぃてぃ",
			"あいでんてぃてぃが",
			"アイデンティティが東京湾に",
		],
		[
			"108117",
			"アノミー",
			"https://www.uta-net.com/song/108117/",
			"あいな",
			"あいなど",
			"あいなどない",
			"あいなどないしら",
			"あいなどないしらな",
			"愛など無い知らない",
		],
		[
			"262707",
			"アイザック",
			"https://www.uta-net.com/song/262707/",
			"あいざ",
			"あいざっ",
			"あいざっくわ",
			"あいざっくわんか",
			"あいざっくわんかー",
			"アイザック 1カートンのナーバス",
		],
	];
	it('無作為に選ばれたクイズテンプレートを生成する', () => {
		const result = quizTemplateOf(testSetSheat, null);

		expect(result).toBeDefined();
		expect(typeof result).toBe('object');

		['songId', 'title', 'url', 'kimariji', 'count4', 'count6', 'count8', 'count10', 'last_quiz']
			.forEach(prop => {
				expect(typeof result[prop]).toBe('string');
				expect(result[prop].length).toBeGreaterThan(0);
			});
	});
	it('十分に試行するとすべてのクイズテンプレートが1回以上作成される', () => {
		const results = Array.from({ length: 1000 }).map((_) => { return quizTemplateOf(testSetSheat, undefined) })
		const songIds = results.map(result => result.songId);
		const uniqueSongIds = new Set(songIds);

		testSetSheat.forEach(template => {
			expect(uniqueSongIds.has(template[0])).toBe(true);
		});
	});
	it('指定された曲IDのクイズテンプレートを生成する', () => {
		const songId = "108117";
		const result = quizTemplateOf(testSetSheat, songId);

		expect(result).toBeDefined();
		expect(typeof result).toBe('object');

		['songId', 'title', 'url', 'kimariji', 'count4', 'count6', 'count8', 'count10', 'last_quiz']
			.forEach(prop => {
				expect(typeof result[prop]).toBe('string');
				expect(result[prop].length).toBeGreaterThan(0);
			});

		expect(result.songId).toBe(songId);
	});
});