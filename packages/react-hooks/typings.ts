import { DocumentNode } from "graphql";
import { MutationHookOptions } from "@apollo/client";
import { VulcanGraphqlModel } from "@vulcanjs/graphql";

export type Fragment = string | DocumentNode; // utility type, doesn't seem to exist in graphql
export interface VulcanMutationHookOptions<
  TData = any,
  TVariables = Record<string, any>
> {
  model: VulcanGraphqlModel;
  fragment?: Fragment;
  fragmentName?: string;
  mutationOptions?: MutationHookOptions<TData, TVariables>;
}
