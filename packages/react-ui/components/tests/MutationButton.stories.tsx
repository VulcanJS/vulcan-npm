import React from "react";
import { Story, Meta } from "@storybook/react";
import { MutationButton, MutationButtonProps } from "../MutationButton";
export default {
  component: MutationButton,
  title: "MutationButton",
  decorators: [
    (Story) => (
      <div>
        <Story />
      </div>
    ),
  ],
  args: {},
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
} as Meta<MutationButtonProps>;

const MutationButtonTemplate: Story<MutationButtonProps> = (args) => (
  <MutationButton {...args} />
);
export const DefaultMutationButton = MutationButtonTemplate.bind({});
