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

export type DefaultMutatorName = "create" | "update" | "delete";
// type CreateCallback = (document: VulcanDocument) => VulcanDocument | Promise<VulcanDocument>
export interface MutationCallbackDefinitions {
  create?: {
    validate?: Array<Function>;
    before?: Array<Function>;
    after?: Array<Function>;
    async?: Array<Function>;
  };
  update?: {
    validate?: Array<Function>;
    before?: Array<Function>;
    after?: Array<Function>;
    async?: Array<Function>;
  };
  delete?: {
    validate?: Array<Function>;
    before?: Array<Function>;
    after?: Array<Function>;
    async?: Array<Function>;
  };
}
interface GraphqlServerModel {
  queryResolvers: QueryResolverDefinitions;
  mutationResolvers: MutationResolverDefinitions;
  callbacks?: MutationCallbackDefinitions;
}
export interface GraphqlModel extends GraphqlSharedModel, GraphqlServerModel {}
export interface VulcanGraphqlModel extends VulcanModel {
  graphql: GraphqlModel;
}
