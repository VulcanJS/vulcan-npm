import React from "react";
import { Story, Meta } from "@storybook/react";
import { Datatable, DatatableProps } from "../Datatable";
import {
  OneFieldGraphql,
  OneFieldType,
} from "../../form/tests/fixtures/graphqlModels";
import { VulcanComponentsProvider } from "@vulcanjs/react-ui";
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
  // @see https://community.redwoodjs.com/t/dealing-with-graphql-success-but-data-is-null-in-storybook/2098
  // It is critical that mocks get all needed fields!
  // We should improve the typings
  oneFields: { results: Array<OneFieldType>; totalCount: number };
}> = {
  operationName: multiOperationName(OneFieldGraphql),
  response: {
    data: {
      // NOTE: MSW is ultra sensitive to missing __typename
      oneFields: {
        results: [{ _id: "1", text: "hello!", __typename: "OneField" }],
        totalCount: 0,
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
