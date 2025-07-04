module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.mts'],
  setupFiles: ['<rootDir>/jest.setup.env.js'],
  reporters: ['default', 'jest-html-reporter'],
  moduleNameMapper: {
    '^@aeopt/(.*)$': '<rootDir>/affluentedge-ai-optimization/src/$1',
    '^@aeopt/utils/(.*)$': '<rootDir>/affluentedge-ai-optimization/src/utils/$1',
    '^@aeopt/journal/(.*)$': '<rootDir>/affluentedge-ai-optimization/src/journal/$1',
    '^@aeopt/utils/validation$': '<rootDir>/affluentedge-ai-optimization/src/utils/validation.ts',
    '^@shared/(.*)$': '<rootDir>/shared/$1',
  },
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
};
