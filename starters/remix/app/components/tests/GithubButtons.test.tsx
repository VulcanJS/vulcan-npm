import { render } from "@testing-library/react";
import { GithubButtons } from "../GithubButtons";

test("Render GithubButtons", () => {
  render(<GithubButtons />);
});

test.skip("Render GithubButtons from Storybook", () => {});
