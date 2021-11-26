/**
 * This file will run before each test file is loaded
 */
// @see https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

import { getMswServer } from "@vulcanjs/utils/testing";
// MSW setup
// TODO: storybook test might already initialize a worker (in preview.js),
// not sure yet of the interaction between this worker and the server we create here
// However, we still need a setup specific to Jest for non-storybook tests
// Enable API mocking before tests.
beforeAll(() => getMswServer().listen());
// Reset any runtime request handlers we may add during the tests.
afterEach(() => getMswServer().resetHandlers());
// Disable API mocking after the tests are done.
afterAll(() => getMswServer().close());
