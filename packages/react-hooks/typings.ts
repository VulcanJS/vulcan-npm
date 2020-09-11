import { MutationHookOptions } from "@apollo/react-hooks";
import { VulcanGraphqlModel } from "@vulcan/graphql/index";

export interface VulcanMutationHookOptions {
  model: VulcanGraphqlModel;
  fragment?: string;
  fragmentName?: string;
  mutationOptions?: MutationHookOptions;
}

export interface QueryInput {
  filter?: Object;
  sort?: any;
  limit?: number;
  offset?: number;
  search?: string;
  enableCache?: boolean; // cache the query, server-side
}
