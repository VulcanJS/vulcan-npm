import { VulcanModel } from "@vulcan/model/index";

// Wrap input type, so the input is in the "input" field as an object
export interface ApolloVariables<TInput> {
  input: TInput;
}

export interface VulcanGraphqlModelSkeleton extends VulcanModel {
  graphql: Pick<GraphqlModel, "typeName">;
}
export interface GraphqlModel {
  typeName: string;
  multiTypeName: string; // plural name for the multi resolver
  multiResolverName: string;
  singleResolverName: string;
  defaultFragment: string;
  defaultFragmentName: string;
}
export interface VulcanGraphqlModel extends VulcanModel {
  graphql: GraphqlModel;
}
