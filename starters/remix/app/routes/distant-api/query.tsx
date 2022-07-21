import { useLoaderData } from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import type { GraphQLError } from "graphql";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  // When using a local executable shema (avoids an HTTP roundtrip)
  //processRequestWithGraphQL,
  // When using a remote endpoint
  sendGraphQLRequest,
} from "@vulcanjs/remix-graphql/index.server";
//import gql from "graphql-tag";

const JERRYS_QUERY = /*gql*/ `
  query {
    characters(page: 1, filter: { name: "jerry" }) {
      info {
        count
      }
      results {
        name
      }
    }
  }
`;

export const loader: LoaderFunction = (args) =>
  //processRequestWithGraphQL({
  sendGraphQLRequest({
    // Pass on the arguments that Remix passes to a loader function.
    args,
    // Provide your schema.
    //schema,
    endpoint: "https://rickandmortyapi.com/graphql",
    // Provide a GraphQL operation that should be executed. This can also be a
    // mutation, it is named `query` to align with the common naming when
    // sending GraphQL requests over HTTP.
    query: JERRYS_QUERY,
    // Optionally provide variables that should be used for executing the
    // operation. If this is not passed, `remix-graphql` will derive variables
    // from...
    // - ...the route params.
    // - ...the submitted `formData` (if it exists).
    variables: { filter: { name: "Jerry" } },
    // Optionally pass an object with properties that should be included in the
    // execution context.
    // context: {},
    // Optionally pass a function to derive a custom HTTP status code for a
    // successfully executed operation.
    /*deriveStatusCode(
          // The result of the execution.
          executionResult: ExecutionResult,
          // The status code that would be returned by default, i.e. of the
          // `deriveStatusCode` function is not passed.
          defaultStatusCode: number
        ) {
          return defaultStatusCode;
        },*/
  });

type LoaderData = {
  data?: {
    characters?: { results?: Array<any> };
  };
  errors?: GraphQLError[];
}; // TODO: compute automatically based on the query?

// Import your schema from whereever you export it
//import { schema } from "~/graphql/schema";

export default function Index() {
  const user = useOptionalUser();
  const { data } = useLoaderData<LoaderData>();
  const jerrys = data?.characters?.results?.length
    ? data.characters.results.slice(0, 5)
    : [];
  return (
    <main className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="relative sm:pb-16 sm:pt-8">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              {/**<img
                className="h-full w-full object-cover"
                src="https://user-images.githubusercontent.com/1500684/157774694-99820c51-8165-4908-a031-34fc371ac0d6.jpg"
                alt="Sonic Youth On Stage"
              />*/}
              <div className="absolute inset-0 bg-[color:#7a273c] mix-blend-multiply" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl py-2 px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl">Results of a loader using GraphQL:</h2>
          <pre>
            <code>{JSON.stringify(jerrys, null, 2)}</code>
          </pre>
          <p>
            Note: no client-side GraphQL was involved! GraphQL is used only
            server-side. Remix handles the data fetching via its loader system
            as usual.
          </p>
        </div>
      </div>
    </main>
  );
}
