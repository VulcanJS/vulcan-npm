import React from "react";
import { Story, Meta } from "@storybook/react";
import { MutationButton, MutationButtonProps } from "../core/MutationButton";
import gql from "graphql-tag";
import { VulcanComponentsProvider } from "../VulcanComponents";
export default {
  component: MutationButton,
  title: "MutationButton",
  decorators: [
    (Story) => (
      <VulcanComponentsProvider>
        <Story />
      </VulcanComponentsProvider>
    ),
  ],
  args: {
    mutation: gql`
      mutation sampleMutation($input: Input) {
        hello
      }
    `,
    mutationArguments: { input: { foo: "bar" } },
    loadingButtonProps: {
      label: "Click me",
    },
  },
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
} as Meta<MutationButtonProps>;

const MutationButtonTemplate: Story<MutationButtonProps> = (args) => (
  <MutationButton {...args} />
);
export const DefaultMutationButton = MutationButtonTemplate.bind({});

export const WithClassName = MutationButtonTemplate.bind({});
WithClassName.args = {
  loadingButtonProps: {
    label: "Click me",
    className: "btn btn-primary",
  },
};
