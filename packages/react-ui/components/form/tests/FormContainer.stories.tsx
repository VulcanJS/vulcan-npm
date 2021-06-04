import React from "react";
import { Story, Meta } from "@storybook/react";
import { SmartForm, SmartFormProps } from "../FormContainer";
import { createGraphqlModel } from "@vulcanjs/graphql";
import { EmptyGraphql } from "./fixtures/models";

// Mocking graphql
import { MockedProvider } from "@apollo/client/testing";
// @see https://www.npmjs.com/package/operation-name-mock-link
import {
  OperationNameMockedResponse,
  OperationNameMockLink,
} from "operation-name-mock-link";
import gql from "graphql-tag";
import { VulcanComponentsProvider } from "../VulcanComponentsContext";
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
    model: createGraphqlModel({
      name: "OneField",
      schema: {
        text: {
          type: String,
          canRead: ["anyone"],
          canCreate: ["anyone"],
        },
      },
      graphql: {
        typeName: "OneField",
        multiTypeName: "OneFields",
      },
    }),
  },
  parameters: { actions: {} },
} as Meta<SmartFormProps>;

const SmartFormTemplate: Story<SmartFormProps> = (args) => (
  <SmartForm {...args} />
);

export const DefaultSmartForm = SmartFormTemplate.bind({});

// Catches aerror and display correctly
class ExpectedErrorBoundary extends React.Component<
  any,
  { hasError: boolean; error?: Error }
> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    console.warn(error);
    // Mettez à jour l'état, de façon à montrer l'UI de repli au prochain rendu.
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // Vous pouvez aussi enregistrer l'erreur au sein d'un service de rapport.
  }
  render() {
    if (this.state.hasError) {
      // Vous pouvez afficher n'importe quelle UI de repli.
      return (
        <div>
          <h2>Everything is fine</h2>
          <p>
            An expected error was caught by the error boundary with message:
          </p>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    return (
      <div>
        <p>
          Waiting for an error to be caught... this message should disappear...
        </p>
        <div>{this.props.children}</div>
      </div>
    );
  }
}
export const Empty = () => (
  <ExpectedErrorBoundary>
    <SmartFormTemplate model={EmptyGraphql} />
  </ExpectedErrorBoundary>
);
