import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";

import { requireUserId } from "~/session.server";

import {
  // When using a local executable shema (avoids an HTTP roundtrip)
  //processRequestWithGraphQL,
  // When using a remote endpoint
  sendGraphQLRequest,
} from "@vulcanjs/remix-graphql/index.server";

type ActionData = {
  errors?: {
    title?: string;
    body?: string;
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

// The `processRequestWithGraphQL` function can be used for both loaders and
// actions!
export const action: ActionFunction = (args) =>
  sendGraphQLRequest({
    args,
    // Space X API is one of the few to allow mutations
    // @see https://studio.apollographql.com/public/SpaceX-pxxbxen/home?variant=current
    endpoint: "https://api.spacex.land/graphql/",
    variables: {
      "objects": [
        { "name": "Eric Burel" }
      ]
    },
    //schema, 
    query: INSERT_USER_MUTATION
  });

export default function NewNotePage() {
  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <Form
      method="post"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Title: </span>
          <input
            ref={titleRef}
            name="title"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            aria-invalid={actionData?.errors?.title ? true : undefined}
            aria-errormessage={
              actionData?.errors?.title ? "title-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.title && (
          <div className="pt-1 text-red-700" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>Body: </span>
          <textarea
            ref={bodyRef}
            name="body"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            aria-invalid={actionData?.errors?.body ? true : undefined}
            aria-errormessage={
              actionData?.errors?.body ? "body-error" : undefined
            }
          />
        </label>
        {actionData?.errors?.body && (
          <div className="pt-1 text-red-700" id="body-error">
            {actionData.errors.body}
          </div>
        )}
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Save
        </button>
      </div>
    </Form>
  );
}





export default function IndexRoute() {
  // TODO: it would be more interesting to demo loading users
  // + updating them
  // const { data } = useLoaderData<LoaderData>();
  // if (!data) {
  //   return "Ooops, something went wrong :(";
  // }
  const data: any = { posts: [] }

  return (
    <main>
      <h1>Blog Posts</h1>
      <ul>
        {data.posts.map((post: any) => (
          <li key={post.id}>
            {post.title} (by {post.author.name})
            <br />
            {post.likes} Likes
            <Form method="post">
              {/* `remix-graphql` will automatically transform all posted 
                  form data into variables of the same name for the GraphQL
                  operation */}
              <input hidden name="id" value={post.id} />
              <button type="submit">Like</button>
            </Form>
          </li>
        ))
      </ul>
    </main>
  );
}