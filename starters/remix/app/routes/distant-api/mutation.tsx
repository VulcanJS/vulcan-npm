import type { ActionFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import {
  // When using a local executable shema (avoids an HTTP roundtrip)
  //processRequestWithGraphQL,
  // When using a remote endpoint
  sendGraphQLRequest,
} from "@vulcanjs/remix-graphql/index.server";

type ActionData = {
  errors?: {
    name?: string;
  };
};

const LIST_USER_QUERY =
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

// TODO: check how we can pick the mutation depending on the "update" or "create" scenario
/**
/*
{
"where": {
  "id": {
    "_eq": "e77584bb-3301-42b6-b952-297170cb8bc8"
  }
},
"set": {
  "name": "Eric Burel v2"
}
}*/
const UPDATE_USER_MUTATION = /* GraphQL */ `
  mutation Update_users($where: users_bool_exp!, $set: users_set_input) {
    update_users(where: $where, _set: $set) {
      returning {
        id
        name
      }
    }
  }
`;

/**
 * {
  "deleteUsersWhere": {
    "id": {
      "_eq": ""
    }
  }
}
 */
const DELETE_USER_MUTATION = /* GraphQL */ `
  mutation Delete_users($deleteUsersWhere: users_bool_exp!) {
    delete_users(where: $deleteUsersWhere) {
      returning {
        name
      }
    }
  }
`;

// The `processRequestWithGraphQL` function can be used for both loaders and
// actions!
export const action: ActionFunction = (args: any) =>
  // TODO: how to handle multiple actions?
  // if (update)
  sendGraphQLRequest({
    args,
    // Space X API is one of the few to allow mutations
    // @see https://studio.apollographql.com/public/SpaceX-pxxbxen/home?variant=current
    endpoint: "https://api.spacex.land/graphql/",
    // TODO: get from args?
    variables: {
      objects: [{ name: "Eric Burel" }],
    },
    //schema,
    query: INSERT_USER_MUTATION,
  });
// else

export default function DistantApiMutationRoute() {
  // TODO: it would be more interesting to demo loading users
  // + updating them
  // const { data } = useLoaderData<LoaderData>();
  // if (!data) {
  //   return "Ooops, something went wrong :(";
  // }
  const data: any = { posts: [] };
  const actionData = useActionData() as ActionData;
  const nameRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    }
  }, [actionData]);

  const inputClass =
    "flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose";
  return (
    <main className="container mx-auto max-w-7xl">
      <h1>Create a SpaceX user</h1>
      <Form method="post" name="create">
        {/* `remix-graphql` will automatically transform all posted 
                  form data into variables of the same name for the GraphQL
                  operation */}
        <div>
          <label htmlFor="name">Name:</label>
          <input
            ref={nameRef}
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
            {actionData.errors.name}
          </div>
        )}
        <button className="rounded border p-4" type="submit">
          Submit
        </button>
      </Form>
    </main>
  );
}
