import { VulcanGraphqlModel } from "../typings";
import { Fragment } from "./typings";

/**
 * Get model fragment in safe manner. Priority:
 * 1) Passed fragment and fragment name
 * 2) Model's defaults
 * 3) Throw an error if model has no default fragment (it can be empty or have fields that we don't yet support like nested)
 *
 * @param param0
 * @returns
 */
export const getModelFragment = ({
  model,
  fragment,
  fragmentName,
}: {
  model: VulcanGraphqlModel;
  fragment?: Fragment;
  fragmentName?: string;
}) => {
  const { defaultFragment, defaultFragmentName } = model.graphql;
  const finalFragment = fragment || defaultFragment;
  const finalFragmentName = fragmentName || defaultFragmentName;
  if (!finalFragment) {
    throw new Error(`Model ${model.name} has no default fragment, maybe it is empty or have only nested fields?
    Please pass a fragment explicitely.`);
  }
  if (!finalFragmentName) {
    throw new Error(`Model ${model.name} has no default fragment name, maybe it is empty or have only nested fields?
    Please pass a fragmentName explicitely.`);
  }
  return {
    finalFragment,
    finalFragmentName,
  };
};
