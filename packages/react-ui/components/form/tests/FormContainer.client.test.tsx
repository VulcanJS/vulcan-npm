/**
 * @client-only
 *
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/testing-react";

import * as stories from "./FormContainer.stories";

const { DefaultSmartForm } = composeStories(stories);

import {
  singleOperationName,
  createGraphqlModel,
  createOperationName,
  updateOperationName,
} from "@vulcanjs/graphql";

import {
  GraphqlQueryStub,
  GraphqlMutationStub,
  graphqlMutationStubsToMsw,
  graphqlQueryStubsToMsw,
} from "@vulcanjs/graphql";
import { OneFieldGraphql, OneFieldType } from "./fixtures/graphqlModels";

import { getMswServer } from "@vulcanjs/utils/testing";

beforeEach(() => {
  // add relevant mocks
  getMswServer().use(...graphqlMutationStubsToMsw([createMock]));
});
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
// NOTE: you could also instead import a story with the MSW decorators for the create mock
// But we leave this as an example of using MSW in tests
test("create an empty document", () => {
  render(<DefaultSmartForm />);
  const submitButton = screen.getByRole("button", { name: /submit/i });
  submitButton.click();
});
