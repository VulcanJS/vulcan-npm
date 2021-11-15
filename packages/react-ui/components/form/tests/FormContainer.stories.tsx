import React from "react";
import { Story, Meta } from "@storybook/react";
import { SmartForm, SmartFormProps } from "../FormContainer";

// Mocking graphql
import { MockedProvider } from "@apollo/client/testing";
// @see https://www.npmjs.com/package/operation-name-mock-link
import {
  OperationNameMockedResponse,
  OperationNameMockLink,
} from "operation-name-mock-link";
import { VulcanComponentsProvider } from "../VulcanComponents/Provider";
import { ExpectedErrorBoundary } from "../../../testing/ExpectedErrorBoundary";
import {} from "@vulcanjs/graphql";
import {
  singleOperationName,
  createGraphqlModel,
  createOperationName,
  updateOperationName,
} from "@vulcanjs/graphql";
import {
  buildSingleQuery,
  buildCreateQuery,
  buildUpdateQuery,
} from "@vulcanjs/react-hooks";
import { OneFieldGraphql, OneFieldType } from "./fixtures/graphqlModels";

// dummy simplified model
const singleMock: OperationNameMockedResponse<{
  oneField: { result: OneFieldType };
}> = {
  request: {
    operationName: singleOperationName(OneFieldGraphql),
    query: buildSingleQuery({
      model: OneFieldGraphql,
    }),
  },
  result: {
    data: {
      oneField: { result: { text: "hello", __typename: "OneField" } },
    },
  },
};

const createMock: OperationNameMockedResponse<any> = {
  request: {
    operationName: createOperationName(OneFieldGraphql),
    query: buildCreateQuery({ model: OneFieldGraphql }),
  },
  result: {
    data: {
      createOneField: {
        // always return the same object whatever the user created
        data: { text: "Hello" },
      },
    },
  },
};
const updateMock: OperationNameMockedResponse<any> = {
  request: {
    operationName: updateOperationName(OneFieldGraphql),
    query: buildUpdateQuery({ model: OneFieldGraphql }),
  },
  result: {
    data: {
      updateOneField: {
        // always return the same object whatever the user created
        data: { text: "successfully updated document" },
      },
    },
  },
};

export default {
  component: SmartForm,
  title: "SmartForm",
  decorators: [
    (Story) => (
      <VulcanComponentsProvider>
        <MockedProvider
          // We replace MockedProvider default link with our custom MockLink
          link={new OperationNameMockLink([], false)}
        >
          <Story />
        </MockedProvider>
      </VulcanComponentsProvider>
    ),
  ],
  args: {
    model: OneFieldGraphql,
  },
  parameters: { actions: {} },
} as Meta<SmartFormProps>;

const SmartFormTemplate: Story<SmartFormProps> = (args) => (
  <SmartForm {...args} />
);

export const DefaultSmartForm = SmartFormTemplate.bind({});

export const CreateSmartForm = SmartFormTemplate.bind({});
CreateSmartForm.args = {};
CreateSmartForm.decorators = [
  (Story) => (
    <MockedProvider link={new OperationNameMockLink([createMock], false)}>
      <Story />
    </MockedProvider>
  ),
];
export const UpdateSmartForm = SmartFormTemplate.bind({});
UpdateSmartForm.args = {
  documentId: "1",
};
UpdateSmartForm.decorators = [
  (Story) => (
    <MockedProvider
      link={new OperationNameMockLink([singleMock, updateMock], false)}
    >
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
