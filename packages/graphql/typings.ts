import { VulcanModel } from "@vulcanjs/model";
import {
  MutationResolverDefinitions,
  QueryResolverDefinitions,
} from "./server/typings";

// Wrap input type, so the input is in the "input" field as an object
export interface ApolloVariables<TInput> {
  input: TInput;
}

export interface VulcanGraphqlModelSkeleton extends VulcanModel {
  graphql: Pick<GraphqlModel, "typeName">;
}
interface GraphqlSharedModel {
  typeName: string;
  multiTypeName: string; // plural name for the multi resolver
  multiResolverName: string;
  singleResolverName: string;
  defaultFragment: string;
  defaultFragmentName: string;
}
interface GraphqlServerModel {
  queryResolvers: QueryResolverDefinitions;
  mutationResolvers: MutationResolverDefinitions;
}
export interface GraphqlModel extends GraphqlSharedModel, GraphqlServerModel {}
export interface VulcanGraphqlModel extends VulcanModel {
  graphql: GraphqlModel;
}
