import React from "react";
import { Story, Meta } from "@storybook/react";
import {
  DatatableContents,
  DatatableContentsProps,
} from "../DatatableContents";
import { OneFieldGraphql } from "../../form/tests/fixtures/graphqlModels";
import { VulcanComponentsProvider } from "@vulcanjs/react-ui";

export default {
  component: DatatableContents,
  title: "DatatableContents",
  decorators: [
    (Story) => (
      // Replace by VulcanComponents if you need them
      <VulcanComponentsProvider>
        <Story />
      </VulcanComponentsProvider>
    ),
  ],
  args: {
    model: OneFieldGraphql,
  },
  parameters: { actions: { argTypesRegex: "^.*Callback$" } },
} as Meta<DatatableContentsProps>;

const DatatableContentsTemplate: Story<DatatableContentsProps> = (args) => (
  <DatatableContents {...args} />
);
export const DefaultDatatableContents = DatatableContentsTemplate.bind({});
