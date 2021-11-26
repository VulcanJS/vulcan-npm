// setupFile.js <-- this will run before the tests in jest.
// STORYBOOK global decorators
import { setGlobalConfig } from "@storybook/testing-react";
import * as globalStorybookConfig from "../.storybook/preview"; // path of your preview.js file

setGlobalConfig(globalStorybookConfig);

// Init fetch
import fetch from "cross-fetch";
global.fetch = fetch;
