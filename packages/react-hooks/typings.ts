import { MutationHookOptions } from "@apollo/react-hooks";
import { VulcanModel } from "@vulcan/model";

export interface VulcanMutationHookOptions {
  model: VulcanModel;
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
