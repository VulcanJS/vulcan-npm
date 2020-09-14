/*

 Generic mutation wrapper to upsert a document in a collection.

 Sample mutation:

   mutation upsertMovie($input: UpsertMovieInput) {
     upsertMovie(input: $input) {
       data {
         _id
         name
         __typename
       }
       __typename
     }
   }

 Arguments:

   - input
     - input.selector: a selector to indicate the document to update
     - input.data: the document (set a field to `null` to delete it)

 Child Props:

   - upsertMovie({ selector, data })

 */

import { useMutation } from "@apollo/react-hooks";
import { MutationResult } from "@apollo/react-common";
import gql from "graphql-tag";

import { upsertClientTemplate } from "@vulcan/graphql";

import { multiQueryUpdater, ComputeNewDataFunc } from "./multiQueryUpdater";
import { computeQueryVariables } from "./variables";
import { computeNewDataAfterCreate } from "./create";
import { VulcanMutationHookOptions } from "./typings";

// We can reuse the same function to compute the new list after an element update
const computeNewDataAfterUpsert: ComputeNewDataFunc = computeNewDataAfterCreate;

const multiQueryUpdaterAfterUpsert = multiQueryUpdater(
  computeNewDataAfterUpsert
);

export const buildUpsertQuery = ({ typeName, fragment, fragmentName }) =>
  gql`
    ${upsertClientTemplate({ typeName, fragmentName })}
    ${fragment}
  `;

interface UpsertInput<TData> {
  data: TData;
  _id?: string;
}
interface UpsertVariables<TData = any> {
  input: UpsertInput<TData>;
}

interface UseUpdateOptions<TData = any>
  extends VulcanMutationHookOptions,
    Partial<UpsertVariables<TData>> {}

type UpsertFunc<T = any> = (args: UpsertVariables<T>) => void;
// Result of the hook
type UseUpsertResult<T = any> = [UpsertFunc<T>, MutationResult<T>]; // return the usual useMutation result, but with an abstracted creation function

export const useUpsert = (options) => {
  const {
    model,
    fragment = model.graphql.defaultFragment,
    fragmentName = model.graphql.defaultFragmentName,
    mutationOptions = {},
  } = options;
  const { typeName } = model.graphql;

  const query = buildUpsertQuery({ typeName, fragmentName, fragment });

  const resolverName = `upsert${typeName}`;

  const [upsertFunc, ...rest] = useMutation(query, {
    errorPolicy: "all",
    // we reuse the update function create, which should actually support
    // upserting
    update: multiQueryUpdaterAfterUpsert({
      model,
      fragment,
      fragmentName,
      resolverName,
    }),
    ...mutationOptions,
  });

  const extendedUpsertFunc = (variables: UpsertVariables) => {
    return upsertFunc({
      variables: {
        ...computeQueryVariables(options, variables),
      },
    });
  };

  return [extendedUpsertFunc, ...rest];
};
