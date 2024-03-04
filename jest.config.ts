import { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  clearMocks: false,
  collectCoverage: false,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', '/src/proto'],
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testTimeout: 100000,
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig-test.json',
      },
    ],
  },
};

export default config;
