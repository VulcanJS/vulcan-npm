/**
 * Basic mutation demo, based on SpaceX API
 */
import type { ActionFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import {
  // When using a local executable shema (avoids an HTTP roundtrip)
  //processRequestWithGraphQL,
  // When using a remote endpoint
  sendGraphQLRequest,
  formDataAsJson,
} from "@vulcanjs/remix-graphql/index.server";

type ActionData = {
  errors?: {
    name?: string;
  };
  data?: {
    insert_users?: {
      returning?: Array<{ id: string; name: string }>;
    };
  };
};

const INSERT_USER_MUTATION = /* GraphQL */ `
  mutation Insert_users($objects: [users_insert_input!]!) {
    insert_users(objects: $objects) {
      returning {
        id
        name
      }
    }
  }
`;

export const action: ActionFunction = async (args) => {
  /**
   * Args contain a request object, which in turns contains FormData
   * We need those values as a POJO in order to define the variables correctly
   *
   * Note: if your form input names are 1:1 equal with variable names,
   * you don't need to pass explicit variables, only "args" is necessary.
   * But it's rarely the case.
   */
  const data = await formDataAsJson(args);
  return sendGraphQLRequest({
    args,
    // Space X API is one of the few to allow mutations
    // @see https://studio.apollographql.com/public/SpaceX-pxxbxen/home?variant=current
    endpoint: "https://api.spacex.land/graphql/",
    variables: {
      objects: [{ name: data.name }],
    },
    //schema,
    query: INSERT_USER_MUTATION,
  });
};
// else

export default function DistantApiMutationRoute() {
  const actionData = useActionData() as ActionData;
  const nameRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    //console.debug("ActionData changed", actionData);
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
    if (actionData?.data?.insert_users?.returning?.[0]) {
      formRef.current?.reset();
    }
  }, [actionData]);

  const inputClass =
    "flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose";
  return (
    <main className="container mx-auto max-w-7xl">
      <h1>Create a SpaceX user</h1>
      <Form method="post" name="create" ref={formRef}>
        {/* `remix-graphql` will automatically transform all posted 
                  form data into variables of the same name for the GraphQL
                  operation */}
        <div>
          <label htmlFor="name">Name:</label>
          <input
            ref={nameRef}
            id="name"
            name="name"
            aria-invalid={actionData?.errors?.name ? true : undefined}
            aria-errormessage={
              actionData?.errors?.name ? "name-error" : undefined
            }
            className={inputClass}
          />
        </div>
        {actionData?.errors?.name && (
          <div className="pt-1 text-red-700" id="title-error">
            <p>{actionData.errors.name}</p>
          </div>
        )}
        {actionData?.data?.insert_users?.returning?.[0] && (
          <div className="pt-1 text-green-700" id="title-error">
            <p>
              Created new user with id{" "}
              {actionData.data.insert_users.returning[0].id}
            </p>
          </div>
        )}
        <button className="rounded border p-4" type="submit">
          Submit
        </button>
      </Form>
    </main>
  );
}
