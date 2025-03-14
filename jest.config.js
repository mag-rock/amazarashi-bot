module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/*.test.js', '**/*.test.ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	moduleFileExtensions: ['js', 'ts']
};