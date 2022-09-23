import React from "react";
import {
  GraphqlMutationStub,
  graphqlMutationStubsToMsw,
  graphqlQueryStubsToMsw,
} from "@vulcanjs/graphql/testing";
import { Story, Meta } from "@storybook/react";
import { defaultCoreComponents, defaultFormComponents, SmartForm, SmartFormProps } from "@vulcanjs/react-ui";

// Mocking graphql
import { VulcanComponentsProvider } from "@vulcanjs/react-ui";
import { ExpectedErrorBoundary } from "@vulcanjs/react-ui/testing";
import { } from "@vulcanjs/graphql";
import {
  singleOperationName,
  createGraphqlModel,
  createOperationName,
  updateOperationName,
} from "@vulcanjs/graphql";
import { OneFieldGraphql, OneFieldType } from "./fixtures/graphqlModels";
import { VulcanCurrentUserProvider } from "@vulcanjs/react-ui";
import { liteCoreComponents } from "../../..";
import { liteFormComponents } from "../../..";

// dummy simplified model
const singleMock: GraphqlMutationStub<{
  oneField: { result: OneFieldType };
}> = {
  operationName: singleOperationName(OneFieldGraphql),
  response: {
    data: {
      oneField: { result: { text: "hello", __typename: "OneField" } },
    },
  },
};

const createMock: GraphqlMutationStub<any> = {
  operationName: createOperationName(OneFieldGraphql),
  //query: buildCreateQuery({ model: OneFieldGraphql }),
  response: {
    data: {
      createOneField: {
        // always return the same object whatever the user created
        data: { text: "Hello" },
      },
    },
  },
};
const updateMock: GraphqlMutationStub<any> = {
  operationName: updateOperationName(OneFieldGraphql),
  response: {
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
      <VulcanComponentsProvider
        value={{
          ...defaultCoreComponents,
          ...defaultFormComponents,
          ...liteCoreComponents,
          ...liteFormComponents
        }}
      >
        <Story />
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
CreateSmartForm.parameters = {
  msw: graphqlMutationStubsToMsw([createMock]),
};

export const UpdateSmartForm = SmartFormTemplate.bind({});
UpdateSmartForm.args = {
  documentId: "1",
};
UpdateSmartForm.parameters = {
  msw: [
    ...graphqlQueryStubsToMsw([singleMock]),
    ...graphqlMutationStubsToMsw([updateMock]),
  ],
};

const MemberOnlyModel = createGraphqlModel({
  name: "MemberOnly",
  schema: {
    text: {
      type: String,
      canCreate: ["members"],
      canRead: ["members"],
    },
  },
  graphql: {
    typeName: "Empty",
    multiTypeName: "Empties",
  },
});
export const MemberOnlySmartForm = SmartFormTemplate.bind({});
MemberOnlySmartForm.args = {
  model: MemberOnlyModel,
};
// TODO: add MSW mock to get current User + define useCurrentUser hook in vulcanjs/graphql
export const MemberOnlyLoggedInSmartForm = SmartFormTemplate.bind({});
MemberOnlyLoggedInSmartForm.args = {
  model: MemberOnlyModel,
  currentUser: { _id: "1234", groups: ["members"], isAdmin: false },
};
export const MemberOnlyLoggedInSmartFormContext = SmartFormTemplate.bind({});
MemberOnlyLoggedInSmartFormContext.args = {
  model: MemberOnlyModel,
};
MemberOnlyLoggedInSmartFormContext.decorators = [
  (Story) => (
    <VulcanCurrentUserProvider
      value={{
        currentUser: { _id: "1234", groups: ["members"], isAdmin: false },
        loading: false,
      }}
    >
      <Story />
    </VulcanCurrentUserProvider>
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
