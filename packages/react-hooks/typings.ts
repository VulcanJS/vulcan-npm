import { DocumentNode } from "graphql";
import { MutationHookOptions } from "@apollo/client";
import { VulcanGraphqlModel } from "@vulcanjs/graphql";

export interface VulcanMutationHookOptions<
  TData = any,
  TVariables = Record<string, any>
> {
  model: VulcanGraphqlModel;
  fragment?: string | DocumentNode;
  fragmentName?: string;
  mutationOptions?: MutationHookOptions<TData, TVariables>;
}
