// /*

// Generic mutation wrapper to insert a new document in a collection and update
// a related query on the client with the new item and a new total item count.

// Sample mutation:

//   mutation createMovie($data: CreateMovieData) {
//     createMovie(data: $data) {
//       data {
//         _id
//         name
//         __typename
//       }
//       __typename
//     }
//   }

// Arguments:

//   - data: the document to insert

// Child Props:

//   - createMovie({ data })

// */

import { useMutation, MutationResult, gql, FetchResult } from "@apollo/client";

import { filterFunction } from "@vulcanjs/mongo";
import { createClientTemplate } from "@vulcanjs/graphql";

import { multiQueryUpdater, ComputeNewDataFunc } from "./multiQueryUpdater";
import { VulcanMutationHookOptions } from "./typings";

import { addToData, matchSelector } from "./cacheUpdate";

import debug from "debug";
const debugApollo = debug("vn:apollo");
/**
 * Compute the new list after a create mutation
 * @param param0
 */
export const computeNewDataAfterCreate: ComputeNewDataFunc = async ({
  model,
  variables,
  queryResult,
  mutatedDocument,
  multiResolverName,
}) => {
  const newDoc = mutatedDocument;
  // get mongo selector and options objects based on current terms
  const multiInput = variables.input;
  // TODO: the 3rd argument is the context, not available here
  // Maybe we could pass the currentUser? The context is passed to custom filters function
  const filter = await filterFunction(model, multiInput, {});
  const { selector, options: paramOptions } = filter;
  const { sort } = paramOptions;
  debugApollo("Got query", queryResult, ", and filter", filter);
  // check if the document should be included in this query, given the query filters
  if (matchSelector(newDoc, selector)) {
    debugApollo("Document matched, updating the data");
    // TODO: handle order using the selector
    const newData = addToData({
      queryResult,
      multiResolverName,
      document: newDoc,
      sort,
      selector,
    });
    return newData;
  }
  return null;
};
const multiQueryUpdaterAfterCreate = multiQueryUpdater(
  computeNewDataAfterCreate
);

export const buildCreateQuery = ({ typeName, fragmentName, fragment }) => {
  const query = gql`
    ${createClientTemplate({ typeName, fragmentName })}
    ${fragment}
  `;
  return query;
};

// Add data into the resolverName
const buildResult = <TData = any>(
  options,
  resolverName,
  executionResult
): CreateResult<TData> => {
  const { data } = executionResult;
  const props = {
    ...executionResult,
    document: data && data[resolverName] && data[resolverName].data,
  };
  return props;
};

interface CreateInput<TData = any> {
  data: TData;
}
interface CreateVariables<TData = any> {
  input: CreateInput<TData>;
}
interface UseCreateOptions extends VulcanMutationHookOptions {}
/**
 * Result of the actual create function
 */
interface CreateResult<TData = any> extends FetchResult<TData> {
  data: any; // TData seems to sometime be the type of the object, sometimes of the full response...
  document: TData;
}
type CreateFunc<TData = any> = (
  args: CreateVariables<TData>
) => Promise<CreateResult<TData>>;

type UseCreateResult<T = any> = [CreateFunc<T>, MutationResult<T>]; // return the usual useMutation result, but with an abstracted creation function
export const useCreate = <TData = any>(
  options: UseCreateOptions
): UseCreateResult => {
  const {
    model,
    fragment = model.graphql.defaultFragment,
    fragmentName = model.graphql.defaultFragmentName,
    mutationOptions = {},
  } = options;

  const { typeName } = model.graphql;

  const query = buildCreateQuery({ typeName, fragmentName, fragment });

  const resolverName = `create${typeName}`;

  const [createFunc, ...rest] = useMutation(query, {
    update: multiQueryUpdaterAfterCreate({
      model,
      fragment,
      fragmentName,
      resolverName,
    }),
    ...mutationOptions,
  });

  const extendedCreateFunc = async (args: CreateVariables) => {
    const executionResult = await createFunc({
      variables: { input: args.input },
    });
    return buildResult<TData>(options, resolverName, executionResult);
  };
  return [extendedCreateFunc, ...rest];
};
