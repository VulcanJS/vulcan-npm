import { render } from "@testing-library/react";
import { GithubButtons } from "../GithubButtons";
import { composeStories } from "@storybook/testing-react";
import * as stories from "./GithubButtons.stories"; // import all stories from the stories file

const { Basic } = composeStories(stories);

test("Render GithubButtons", () => {
  render(<GithubButtons />);
  expect(document.querySelector("section")).toBeDefined();
});

test("Render GithubButtons from Storybook", () => {
  render(<Basic />);
  expect(document.querySelector("section")).toBeDefined();
});
