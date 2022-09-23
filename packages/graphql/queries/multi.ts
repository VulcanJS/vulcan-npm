import type { DocumentNode } from "graphql";
import gql from "graphql-tag";
import { multiClientTemplate } from "../templates";
import type { VulcanGraphqlModel } from "../typings";

interface BuildMultiQueryArgs {
  model: VulcanGraphqlModel;
  fragmentName?: string;
  fragment?: string | DocumentNode;
  extraQueries?: string;
}

/**
 * Graphql Query for getting multiple documents
 */
export const multiQuery = ({
  model,
  fragmentName = model.graphql.defaultFragmentName,
  fragment = model.graphql.defaultFragment,
  extraQueries,
}: BuildMultiQueryArgs) => {
  const { typeName, multiTypeName } = model.graphql;
  return gql`
    ${multiClientTemplate({
      typeName,
      multiTypeName,
      fragmentName,
      extraQueries,
    })}
    ${fragment}
  `;
};
