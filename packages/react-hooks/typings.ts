import type { MutationHookOptions } from "@apollo/client/react/index.js";
import { Fragment, VulcanGraphqlModel } from "@vulcanjs/graphql";

export interface VulcanMutationHookOptions<
  TData = any,
  TVariables = Record<string, any>
> {
  model: VulcanGraphqlModel;
  fragment?: Fragment;
  fragmentName?: string;
  mutationOptions?: MutationHookOptions<TData, TVariables>;
}
