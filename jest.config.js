module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.test.ts'],
	transform: {
		'^.+\\.ts$': 'ts-jest'
	},
	moduleFileExtensions: ['js', 'ts'],
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	}
};