module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['dotenv/config'],
  reporters: ['default', 'jest-html-reporter'],
  moduleNameMapper: {
    '^@aeopt/(.*)$': '<rootDir>/affluentedge-ai-optimization/src/$1',
    '^@aeopt/utils/(.*)$': '<rootDir>/affluentedge-ai-optimization/src/utils/$1',
    '^@aeopt/journal/(.*)$': '<rootDir>/affluentedge-ai-optimization/src/journal/$1',
    '^@aeopt/utils/validation$': '<rootDir>/affluentedge-ai-optimization/src/utils/validation.ts',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
};
