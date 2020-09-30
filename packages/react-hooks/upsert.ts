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

import { useMutation, MutationResult, gql, FetchResult } from "@apollo/client";

import { upsertClientTemplate } from "@vulcanjs/graphql";

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

interface UpsertInput<TModel> {
  data: TModel;
  _id?: string;
}
interface UpsertVariables<TModel = any> {
  input: UpsertInput<TModel>;
}

interface UseUpsertOptions<TModel = any>
  extends VulcanMutationHookOptions,
    Partial<UpsertVariables<TModel>> {}

interface UpsertFuncResult<TModel, TData = any> extends FetchResult<TData> {
  document: TModel;
}
type UpsertFunc<TModel = any> = (
  args: UpsertVariables<TModel>
) => Promise<UpsertFuncResult<TModel>>;
// Result of the hook
type UseUpsertResult<TModel = any, TData = any> = [
  UpsertFunc<TModel>,
  MutationResult<TData>
]; // return the usual useMutation result, but with an abstracted creation function

export const useUpsert = <TModel = any>(
  options: UseUpsertOptions
): UseUpsertResult<TModel> => {
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

  const extendedUpsertFunc = async (variables: UpsertVariables) => {
    const executionResult = await upsertFunc({
      variables: {
        ...computeQueryVariables(options, variables),
      },
    });
    const { data } = executionResult;
    return { ...executionResult, document: data?.[resolverName]?.data };
  };

  return [extendedUpsertFunc, ...rest];
};
