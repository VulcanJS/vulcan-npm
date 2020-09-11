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

import { useMutation } from "@apollo/react-hooks";
import { MutationResult } from "@apollo/react-common";
import gql from "graphql-tag";

import { updateClientTemplate } from "@vulcan/graphql";

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
interface UpdateInput<TData> {
  data: TData;
  id?: string;
}
interface UpdateVariables<TData = any> {
  input: UpdateInput<TData>;
}
// Options of the hook
interface UseUpdateOptions<TData = any>
  extends VulcanMutationHookOptions,
    Partial<UpdateVariables<TData>> {}
// Function returned by the hook
type UpdateFunc<T = any> = (args: UpdateVariables<T>) => void;
// Result of the hook
type UseUpdateResult<T = any> = [UpdateFunc<T>, MutationResult<T>]; // return the usual useMutation result, but with an abstracted creation function

/**
 * const [updateFoo] = useUpdate({model: Foo})
 * ...
 * await updateFoo({input: { _id: "1234", data: myNewFoo }})
 */
export const useUpdate = <TData = any>(
  options: UseUpdateOptions
): UseUpdateResult<TData> => {
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

  const extendedUpdateFunc = (variables: UpdateVariables) => {
    return updateFunc({
      variables: {
        ...computeQueryVariables(options, variables),
      },
    });
  };
  return [extendedUpdateFunc, ...rest];
};
