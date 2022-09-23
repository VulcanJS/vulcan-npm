import { installGlobals } from "@remix-run/node";
import "@testing-library/jest-dom/extend-expect";

// @see https://storybook.js.org/addons/@storybook/testing-react
import { setGlobalConfig } from "@storybook/testing-react";
// path of your preview.js file
import * as globalStorybookConfig from "../.storybook/preview";

installGlobals();

setGlobalConfig(globalStorybookConfig);
