// Button.stories.ts|tsx
import type { ComponentStory, ComponentMeta } from "@storybook/react";

import { GithubButtons } from "../GithubButtons";

export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "GithubButtons",
  component: GithubButtons,
} as ComponentMeta<typeof GithubButtons>;

export const Basic: ComponentStory<typeof GithubButtons> = () => (
  <GithubButtons />
);
