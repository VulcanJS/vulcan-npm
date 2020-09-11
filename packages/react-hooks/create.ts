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

import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { createClientTemplate } from "@vulcan/graphql";
import { multiQueryUpdater, ComputeNewDataFunc } from "./multiQueryUpdater";
import { MutationResult } from "@apollo/react-common";
import { VulcanMutationHookOptions } from "./typings";

import { addToData, matchSelector } from "./cacheUpdate";
import { filterFunction } from "@vulcan/mongo";

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
const buildResult = (options, resolverName, executionResult) => {
  const { data } = executionResult;
  const propertyName = options.propertyName || "document";
  const props = {
    ...executionResult,
    [propertyName]: data && data[resolverName] && data[resolverName].data,
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
type CreateFunc<T = any> = (args: CreateVariables<T>) => void;
type UseCreateResult<T = any> = [CreateFunc<T>, MutationResult<T>]; // return the usual useMutation result, but with an abstracted creation function
export const useCreate = (options: UseCreateOptions): UseCreateResult => {
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
    return buildResult(options, resolverName, executionResult);
  };
  return [extendedCreateFunc, ...rest];
};
