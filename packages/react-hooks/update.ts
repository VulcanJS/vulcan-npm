// /*

// Generic mutation wrapper to update a document in a collection.

// Sample mutation:

//   mutation updateMovie($input: UpdateMovieInput) {
//     updateMovie(input: $input) {
//       data {
//         _id
//         name
//         __typename
//       }
//       __typename
//     }
//   }

// Arguments:

//   - input
//     - input.selector: a selector to indicate the document to update
//     - input.data: the document (set a field to `null` to delete it)

// Child Props:

//   - updateMovie({ selector, data })

// */

import { useMutation, MutationResult, gql, FetchResult } from "@apollo/client";

import { updateClientTemplate } from "@vulcanjs/graphql";

import { multiQueryUpdater, ComputeNewDataFunc } from "./multiQueryUpdater";
import { computeQueryVariables } from "./variables";
import { computeNewDataAfterCreate } from "./create";
import { VulcanMutationHookOptions } from "./typings";

// We can reuse the same function to compute the new list after an element update
const computeNewDataAfterUpdate: ComputeNewDataFunc = computeNewDataAfterCreate;

const multiQueryUpdaterAfterUpdate = multiQueryUpdater(
  computeNewDataAfterUpdate
);

export const buildUpdateQuery = ({ typeName, fragmentName, fragment }) =>
  gql`
    ${updateClientTemplate({ typeName, fragmentName })}
    ${fragment}
  `;

// Describe the update input, can be provided to the hook or the update function
interface UpdateInput<TModel> {
  data: TModel;
  id?: string;
}
interface UpdateVariables<TModel = any> {
  input: UpdateInput<TModel>;
}
// Options of the hook
interface UseUpdateOptions<TModel = any>
  extends VulcanMutationHookOptions,
    Partial<UpdateVariables<TModel>> {}
// Function returned by the hook
interface UpdateFuncResult<TModel = any, TData = any>
  extends FetchResult<TData> {
  document: TModel; // shortcut to get the document
}
type UpdateFunc<TData = any> = (
  args: UpdateVariables<TData>
) => Promise<UpdateFuncResult<TData>>;
// Result of the hook itself
type UseUpdateResult<T = any> = [UpdateFunc<T>, MutationResult<T>]; // return the usual useMutation result, but with an abstracted creation function

/**
 * const [updateFoo] = useUpdate({model: Foo})
 * ...
 * await updateFoo({input: { _id: "1234", data: myNewFoo }})
 */
export const useUpdate = <TModel = any>(
  options: UseUpdateOptions
): UseUpdateResult<TModel> => {
  const {
    model,
    fragment = model.graphql.defaultFragment,
    fragmentName = model.graphql.defaultFragmentName,
    mutationOptions = {},
  } = options;

  const { typeName } = model.graphql;

  const query = buildUpdateQuery({ typeName, fragmentName, fragment });

  const resolverName = `update${typeName}`;

  const [updateFunc, ...rest] = useMutation(query, {
    // see https://www.apollographql.com/docs/react/features/error-handling/#error-policies
    errorPolicy: "all",
    update: multiQueryUpdaterAfterUpdate({
      model,
      fragment,
      fragmentName,
      resolverName,
    }),
    ...mutationOptions,
  });

  const extendedUpdateFunc = async (variables: UpdateVariables<TModel>) => {
    const executionResult = await updateFunc({
      variables: {
        ...computeQueryVariables(options, variables),
      },
    });
    const { data } = executionResult;
    return { ...executionResult, document: data?.[resolverName]?.data };
  };
  return [extendedUpdateFunc, ...rest];
};
