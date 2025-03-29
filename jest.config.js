module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.test.ts'],
	transform: {
		'^.+\\.ts$': ['ts-jest', {
			isolatedModules: true,
			diagnostics: false
		}]
	},
	moduleFileExtensions: ['js', 'ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	cache: true,
	cacheDirectory: '<rootDir>/.jest-cache',
	transformIgnorePatterns: [
		'node_modules/(?!(twitter-text)/)'
	],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};