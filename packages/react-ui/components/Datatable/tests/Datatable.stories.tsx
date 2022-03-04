import React from "react";
import { Story, Meta } from "@storybook/react";
import { Datatable, DatatableProps } from "../Datatable";
import {
  OneFieldGraphql,
  OneFieldType,
} from "../../form/tests/fixtures/graphqlModels";
import { VulcanComponentsProvider } from "../../VulcanComponents";
import {
  GraphqlMutationStub,
  graphqlQueryStubsToMsw,
} from "@vulcanjs/graphql/testing";
import { multiOperationName } from "@vulcanjs/graphql";

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

const multiMock: GraphqlMutationStub<{
  oneFields: { results: Array<OneFieldType> };
}> = {
  operationName: multiOperationName(OneFieldGraphql),
  response: {
    data: {
      oneFields: {
        results: [{ text: "hello!", __typename: "OneField" }],
      },
    },
  },
};

// STORIES
const DatatableTemplate: Story<DatatableProps> = (args) => (
  <Datatable {...args} />
);
export const DefaultDatatable = DatatableTemplate.bind({});

export const WithOneItem = DatatableTemplate.bind({});
WithOneItem.parameters = {
  msw: [...graphqlQueryStubsToMsw([multiMock])],
};
