import { MutationHookOptions } from "@apollo/client";
import { VulcanGraphqlModel } from "@vulcanjs/graphql";

export interface VulcanMutationHookOptions<
  TData = any,
  TVariables = Record<string, any>
> {
  model: VulcanGraphqlModel;
  fragment?: string;
  fragmentName?: string;
  mutationOptions?: MutationHookOptions<TData, TVariables>;
}

type MongoLikeSortOption = "asc" | "desc";
type MongoLikeCondition =
  | "_eq"
  | "_gt"
  | "_gte"
  | "_in"
  | "_lt"
  | "_lte"
  | "_neq"
  | "_nin"
  | "_is_null"
  | "_is"
  | "_contains"
  | "_like";

type MongoLikeSelector = {
  [key in MongoLikeCondition]?: any;
};
export interface QueryInput<TModel = any> {
  filter?: { [fieldName in keyof TModel]?: MongoLikeSelector };
  sort?: { [fieldName in keyof TModel]?: MongoLikeSortOption };
  limit?: number;
  offset?: number;
  search?: string;
  enableCache?: boolean; // cache the query, server-side
}
