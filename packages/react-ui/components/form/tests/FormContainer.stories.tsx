import React from "react";
import { Story, Meta } from "@storybook/react";
import { SmartForm, SmartFormProps } from "../FormContainer";
import { createGraphqlModel, createOperationName } from "@vulcanjs/graphql";

// Mocking graphql
import { MockedProvider } from "@apollo/client/testing";
// @see https://www.npmjs.com/package/operation-name-mock-link
import {
  OperationNameMockedResponse,
  OperationNameMockLink,
} from "operation-name-mock-link";
import { VulcanComponentsProvider } from "../VulcanComponents/Provider";
import { ExpectedErrorBoundary } from "../../../testing/ExpectedErrorBoundary";
import { singleOperationName } from "@vulcanjs/graphql";
import { buildSingleQuery, buildCreateQuery } from "@vulcanjs/react-hooks";

// dummy simplified model
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

const singleMock: OperationNameMockedResponse<{
  empty: { result: OneFieldType };
}> = {
  request: {
    operationName: singleOperationName(OneField),
    query: buildSingleQuery({
      model: OneField,
    }),
  },
  result: {},
};

const createMock: OperationNameMockedResponse<any> = {
  request: {
    operationName: createOperationName(OneField),
    query: buildCreateQuery({ model: OneField }),
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
    model: OneField,
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
export const EditSmartForm = SmartFormTemplate.bind({});
EditSmartForm.args = {
  documentId: "1",
};
EditSmartForm.decorators = [
  (Story) => (
    <MockedProvider link={new OperationNameMockLink([singleMock], false)}>
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
