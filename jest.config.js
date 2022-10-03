// No need to use ts-jest https://github.com/vercel/next.js/discussions/13528#discussioncomment-22933
// Client and server Jest config
// You can find two projects below, corresponding to the client-side config and the server-side config

// configuration that must be set for each project but does not change
const commonConfig = {
  // A map from regular expressions to paths to transformers
  transform: {
    // add mjs so they are turned into cjs automatically until Jest
    // have a better support of ESM, @see https://jestjs.io/fr/docs/ecmascript-modules
    // https://babeljs.io/docs/en/babel-plugin-transform-modules-commonjs
    // and https://bl.ocks.org/rstacruz/511f43265de4939f6ca729a3df7b001c
    "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
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
    "/node_modules/(?!(@apollo/client|ts-invariant))",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
    // @see https://github.com/swc-project/jest/issues/64
    // Allow .js in index.ts barrel files
    '^(\\.{1,2}/.*)\\.js$': '$1',

  },
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage-unit",

  // Stop running tests after `n` failures
  // bail: 0,

  // Respect "browser" field in package.json when resolving modules
  // browser: false,

  // The directory where Jest should store its cached dependency information
  // cacheDirectory: "/tmp/jest_rs",

  // Automatically clear mock calls and instances between every test
  // clearMocks: false,

  // Indicates whether the coverage information should be collected while executing the test
  // collectCoverage: false,

  // An array of regexp pattern strings used to skip coverage collection
  // coveragePathIgnorePatterns: [
  //   "/node_modules/"
  // ],

  // A list of reporter names that Jest uses when writing coverage reports
  // coverageReporters: [
  //   "json",
  //   "text",
  //   "lcov",
  //   "clover"
  // ],

  // An object that configures minimum threshold enforcement for coverage results
  // coverageThreshold: undefined,

  // A path to a custom dependency extractor
  // dependencyExtractor: undefined,

  // Make calling deprecated APIs throw helpful error messages
  // errorOnDeprecated: false,

  // Force coverage collection from ignored files using an array of glob patterns
  // forceCoverageMatch: [],

  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: undefined,

  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: undefined,

  // A set of global variables that need to be available in all test environments
  //globals: {
  //  "ts-jest": {
  //    tsConfig: "./tsconfig.jest.json",
  //  },
  //},

  // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the maximum worker number. maxWorkers: 2 will use a maximum of 2 workers.
  // maxWorkers: "50%",

  // An array of directory names to be searched recursively up from the requiring module's location
  // moduleDirectories: [
  //   "node_modules"
  // ],

  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],

  // A map from regular expressions to module names that allow to stub out resources with a single module
  //moduleNameMapper: {
  //"~/(.*)": "<rootDir>/src/$1",
  //"@vulcanjs/(.*)": "<rootDir>/packages/@vulcanjs/$1",
  //},

  // An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
  // modulePathIgnorePatterns: [],

  // Activates notifications for test results
  // notify: false,

  // An enum that specifies notification mode. Requires { notify: true }
  // notifyMode: "failure-change",

  // A preset that is used as a base for Jest's configuration
  // preset: undefined,

  // Use this configuration option to add custom reporters to Jest
  // reporters: undefined,

  // Automatically reset mock state between every test
  // resetMocks: false,

  // Reset the module registry before running each individual test
  // resetModules: false,

  // A path to a custom resolver
  // resolver: undefined,

  // Automatically restore mock state between every test
  // restoreMocks: false,

  // The root directory that Jest should scan for tests and modules within
  //rootDir: undefined,

  // A list of paths to directories that Jest should use to search for files in
  roots: [
    "<rootDir>/packages",
    // "<rootDir>/tests"
  ],

  // Allows you to use a custom runner instead of Jest's default test runner
  // runner: "jest-runner",

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  // setupFilesAfterEnv: [],

  // A list of paths to snapshot serializer modules Jest should use for snapshot testing
  // snapshotSerializers: [],

  // Options that will be passed to the testEnvironment
  // testEnvironmentOptions: {},

  // Adds a location field to test results
  // testLocationInResults: false,

  // The regexp pattern or array of patterns that Jest uses to detect test files
  // testRegex: [],

  // This option allows the use of a custom results processor
  // testResultsProcessor: undefined,

  // This option allows use of a custom test runner
  // testRunner: "jasmine2",

  /*
  testEnvironmentOptions: {
  // This option sets the URL for the jsdom environment. It is reflected in properties such as location.href
   url: 'https://jestjs.io'
 }*/

  // Setting this value to "fake" allows the use of fake timers for functions such as "setTimeout"
  /*
   fakeTimers: {
   enableGlobally: true
 }*/

  // An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them
  // unmockedModulePathPatterns: undefined,

  // Indicates whether each individual test should be reported during the run
  // verbose: undefined,

  // An array of regexp patterns that are matched against all source file paths before re-running tests in watch mode
  // watchPathIgnorePatterns: [],

  // Whether to use watchman for file crawling
  // watchman: true,
};

module.exports = {
  // shared configuration for global features, such as coverage computation
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    // we have to explicitely exclude tests from coverage when using "projects" options
    // because Jest can't tell anymore which files is a test or not as it varies per environment
    "!**/__tests__/**/*.[jt]s?(x)",
    "!**/*.test.[jt]s?(x)",
    "!coverage/**",
    "!.next/**",
    // we exclude configuration files from coverage computation
    "!*.js",
    //"!**/stor{y,ies}.{js,ts,jsx,tsx}",
    //"!**/*.stor{y,ies}.{js,ts,jsx,tsx}",
    //"!**/cypress/**",
    //"!**/.storybook/**",
    //"!**/stories/**",
    //"!**/storybook-static/**",
    // "!jest.config.js",
    //"!**/out/**",
    // "!**/dist/**",
    // "!**/public/**",
    // "!**/build/**",
    // "!**/coverage/**",
  ],

  // configuration for each environment (client or server)
  projects: [
    {
      ...commonConfig,
      displayName: "jsdom",
      testEnvironment: "jsdom",
      testMatch: [
        "**/!(*.server).test.[jt]s?(x)",
        // will ignore any file in a "server" folder
        // order matters: https://jestjs.io/fr/docs/configuration#testmatch-arraystring
        "!**/server/**",
      ],
      modulePaths: ["<rootDir>"],
      // The paths to modules that run some code to configure or set up the testing environment before each test
      setupFiles: ["./jest/setup.js"],
      setupFilesAfterEnv: ["./jest/setupFilesAfterEnv.ts"],
    },
    {
      ...commonConfig,
      displayName: "server",
      testEnvironment: "node",
      testMatch: [
        "**/*.server.test.[jt]s?(x)",
        "**/server/**/*.test.[jt]s?(x)",
      ],
      // The paths to modules that run some code to configure or set up the testing environment before each test
      setupFiles: ["./jest/setup.server.js"],
    },
    // integration tests
    {
      ...commonConfig,
      displayName: "integration-client",
      testEnvironment: "jsdom",
      roots: undefined,
      rootDir: ".",
      testMatch: ["<rootDir>/test/integration/client/**/*.test.[jt]s?(x)"],
    },
    {
      ...commonConfig,
      displayName: "integration-server",
      testEnvironment: "node",
      roots: undefined,
      rootDir: ".",
      testMatch: ["<rootDir>/test/integration/server/**/*.test.[jt]s?(x)"],
    },
  ],
};
