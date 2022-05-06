import type { VulcanGraphqlModel } from "../typings";
import type { Fragment } from "./typings";
import type { DocumentNode, FragmentDefinitionNode } from "graphql";

/**
 * Get model fragment in safe manner. Priority:
 * 1) Passed fragment, will autocompute fragment name if passing a DocumentNode (otherwise, pass an explicit fragment name)
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
  if (!finalFragment) {
    throw new Error(`Model ${model.name} has no default fragment, maybe it is empty or have only nested fields?
    Please pass a fragment explicitely.`);
  }
  let finalFragmentName: string | undefined;
  // if fragment is a documentNode, we automatically get the fragmentName
  if (typeof finalFragment !== "string") {
    finalFragmentName = getFragmentName(finalFragment);
  } else {
    finalFragmentName = fragmentName || defaultFragmentName;
  }
  if (!finalFragmentName) {
    throw new Error(`Model ${model.name} has no default fragment name, maybe it is empty or have only nested fields?
    Please pass a fragmentName explicitely, or a DocumentNode fragment (using gql tag).`);
  }
  return {
    finalFragment,
    finalFragmentName,
  };
};

export const getFragmentName = (f: DocumentNode) => {
  const name = (f?.definitions?.[0] as FragmentDefinitionNode)?.name?.value;
  if (!name)
    throw new Error(`Provided fragment has no name. Check that your fragment is wrapped
  with "gql" and that it's actually a fragment. AST: ${JSON.stringify(f)}`);
  return name;
};
