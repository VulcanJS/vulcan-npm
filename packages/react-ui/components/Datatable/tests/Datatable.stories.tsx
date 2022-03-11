import React from "react";
import { Story, Meta } from "@storybook/react";
import { Datatable, DatatableProps } from "../Datatable";
import {
  OneFieldGraphql,
  OneFieldType,
} from "../../form/tests/fixtures/graphqlModels";
import { VulcanComponentsProvider } from "../../VulcanComponents";
import {
  GraphqlQueryStub,
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

const oneMultiMock: GraphqlQueryStub<{
  oneFields: { results: Array<OneFieldType> };
}> = {
  operationName: multiOperationName(OneFieldGraphql),
  response: {
    data: {
      // NOTE: MSW is ultra sensitive to missing __typename
      oneFields: {
        results: [{ text: "hello!", __typename: "OneField" }],
      },
    },
  },
};
const emptyMultiMock: GraphqlQueryStub<{
  oneFields: { results: Array<OneFieldType> };
}> = {
  operationName: multiOperationName(OneFieldGraphql),
  response: {
    data: {
      // NOTE: MSW is ultra sensitive to missing __typename
      oneFields: {
        results: [],
      },
    },
  },
};

// STORIES
const DatatableTemplate: Story<DatatableProps> = (args) => (
  <Datatable {...args} />
);
export const DefaultDatatable = DatatableTemplate.bind({});
DefaultDatatable.parameters = {
  msw: {
    handlers: [...graphqlQueryStubsToMsw([emptyMultiMock])],
  },
};

export const WithOneItem = DatatableTemplate.bind({});
WithOneItem.parameters = {
  msw: {
    handlers: [...graphqlQueryStubsToMsw([oneMultiMock])],
  },
};
