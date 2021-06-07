import React from "react";
import { Story, Meta } from "@storybook/react";
import { SmartForm, SmartFormProps } from "../FormContainer";
import { createGraphqlModel } from "@vulcanjs/graphql";

// Mocking graphql
import { MockedProvider } from "@apollo/client/testing";
// @see https://www.npmjs.com/package/operation-name-mock-link
import {
  OperationNameMockedResponse,
  OperationNameMockLink,
} from "operation-name-mock-link";
import gql from "graphql-tag";
import { VulcanComponentsProvider } from "../VulcanComponents/Provider";
import { ExpectedErrorBoundary } from "../../../testing/ExpectedErrorBoundary";
import { buildSingleQuery } from "@vulcanjs/react-hooks/single";
import { singleOperationName } from "@vulcanjs/graphql";
// TODO: create mocks for data fetching, data creation, data update
interface GetSomeDataResult {
  getSomeData: {
    id: string;
  };
}
const mock: OperationNameMockedResponse<GetSomeDataResult> = {
  request: {
    operationName: "myQuery",
    query: gql`
      query myQuery {
        getSomeData {
          id
        }
      }
    `,
  },
  result: {
    data: {
      getSomeData: {
        id: "42",
      },
    },
  },
};

interface OneFieldType {
  text: string;
}
const OneField = createGraphqlModel({
  name: "OneField",
  schema: {
    text: {
      type: String,
      canRead: ["anyone"],
      canUpdate: ["anyone"],
      canCreate: ["anyone"],
    },
  },
  graphql: {
    typeName: "OneField",
    multiTypeName: "OneFields",
  },
});
export default {
  component: SmartForm,
  title: "SmartForm",
  decorators: [
    (Story) => (
      <VulcanComponentsProvider>
        <MockedProvider
          // We replace MockedProvider default link with our custom MockLink
          link={new OperationNameMockLink([mock], false)}
        >
          <Story />
        </MockedProvider>
      </VulcanComponentsProvider>
    ),
  ],
  args: {
    model: OneField,
  },
  parameters: { actions: {} },
} as Meta<SmartFormProps>;

const SmartFormTemplate: Story<SmartFormProps> = (args) => (
  <SmartForm {...args} />
);

export const DefaultSmartForm = SmartFormTemplate.bind({});

export const DefaultEditSmartForm = SmartFormTemplate.bind({});
DefaultEditSmartForm.args = {
  documentId: "1",
};
const editMock: OperationNameMockedResponse<{
  empty: { result: OneFieldType };
}> = {
  request: {
    operationName: singleOperationName(OneField.graphql.typeName),
    query: buildSingleQuery({
      model: OneField,
    }),
  },
  result: {},
};
DefaultEditSmartForm.decorators = [
  (Story) => (
    <MockedProvider link={new OperationNameMockLink([editMock], false)}>
      <Story />
    </MockedProvider>
  ),
];

const NotCreateableModel = createGraphqlModel({
  name: "NotCreatable",
  schema: {
    text: {
      type: String,
      canRead: ["any"],
    },
  },
  graphql: {
    typeName: "Empty",
    multiTypeName: "Empties",
  },
});
// it is expected to fail
export const NotCreateable = () => (
  <ExpectedErrorBoundary>
    <SmartFormTemplate model={NotCreateableModel} />
  </ExpectedErrorBoundary>
);
