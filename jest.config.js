// configuration that must be set for each project but does not change
const commonConfig = {
  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    "/node_modules/",
    "/cypress/",
    "/storybook/",
    //"/.next/",
    "/stories/",
  ],
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
    transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage-unit",
}

module.exports = {
  // shared configuration for global features, such as coverage computation
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    // we have to explicitely exclude tests from coverage when using "projects" options
    // because Jest can't tell anymore which files is a test or not as it varies per environment
    '!**/__tests__/**/*.[jt]s?(x)',
    '!**/*.test.[jt]s?(x)',
    '!coverage/**',
    '!.next/**',
    // we exclude configuration files from coverage computation
    '!*.js'
  ],
  
  // configuration for each environment (client or server)
  projects: [
    {
      ...commonConfig,
      name: 'client',
      displayName: 'client',
      // testEnvironment: "jsdom", // defautl already
      testMatch: [
        '**/!(*.server).test.[jt]s?(x)',
      ],
      // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      modulePaths: ['<rootDir>'],
      // The paths to modules that run some code to configure or set up the testing environment before each test
      setupFiles: ["./jest/setup.js"],
    },
    {
      ...commonConfig,
      name: 'server',
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: [
        '**/*.server.test.[jt]s?(x)',
      ],
      // setupFilesAfterEnv: ['<rootDir>/jest.setup.server.js'],
      // The paths to modules that run some code to configure or set up the testing environment before each test
      setupFiles: ["./jest/setup.server.js"],
    },
  ],
}
