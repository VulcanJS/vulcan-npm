import React from "react";
import { Story, Meta } from "@storybook/react";
import { Datatable, DatatableProps } from "../Datatable";
import { OneFieldGraphql } from "../../form/tests/fixtures/graphqlModels";
import { VulcanComponentsProvider } from "../../VulcanComponents";

export default {
  component: Datatable,
  title: "Datatable",
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
} as Meta<DatatableProps>;

const DatatableTemplate: Story<DatatableProps> = (args) => (
  <Datatable {...args} />
);
export const DefaultDatatable = DatatableTemplate.bind({});
