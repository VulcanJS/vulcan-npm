// SCHEMA TYPINGS
// Custom resolver

/**
 * @example       field: {
        type: String,
        optional: true,
        canRead: ["admins"],
        resolveAs: {
          fieldName: "resolvedField",
          type: "Bar",
          resolver: async (root, args, context) => {
            return `Variable value is ${args?.variable}`;
          },
          arguments: "variable: String",
          description: "Some field",
          typeName: "String",
          addOriginalField: true,
        },
      }
 */

// Mutations
export type DefaultMutatorName = "create" | "update" | "delete";

// Wrap input type, so the input is in the "input" field as an object
// Mutation/Hooks typings
interface CommonInput {
  contextName?: string;
}
export interface CreateInput<TModel = any> extends CommonInput {
  data: TModel;
}
export interface CreateVariables<TModel = any> {
  input: CreateInput<TModel>;
}
export interface UpdateInput<TModel> extends CommonInput, FilterableInput {
  data: TModel;
  id?: string;
}
export interface UpdateVariables<TModel = any> {
  input: UpdateInput<TModel>;
}

export interface DeleteInput extends CommonInput, FilterableInput {
  id?: string;
}
export interface DeleteVariables {
  input: DeleteInput;
}

// Filtering and selectors
type VulcanSelectorSortOption = "asc" | "desc";

/**
 * { foo:2}
 * { foo: { _gt: 3}}
 */

type FieldSelector<TModel = any> = {
  [key in keyof TModel]?: ConditionSelector; // NOTE: we cannot yet pass native values | string | number | boolean | null | ;
} &
  { [key in PossibleOperators]?: never };

type ConditionSelector = {
  //[key in VulcanSelectorCondition]?: VulcanSelector<TModel>;
  _eq?: any;
  _gt?: string | number;
  _gte?: string | number;
  _in?: Array<any>;
  _lt?: string | number;
  _lte?: string | number;
  _neq?: any;
  _nin?: Array<any>;
  _is_null?: any;
  _is?: any;
  _contains?: any;
  _like?: string;
};
type PossibleConditions = keyof ConditionSelector;

type PossibleOperators = "_and" | "_or" | "_not";
type OperatorSelector<TModel = any> = {
  [key in PossibleOperators]?: Array<FieldSelector<TModel>>; // Array<VulcanSelector<TModel>>; //VulcanInnerSelector<TModel>>;
};

// Field selector = { foo: 2} where foo is part of the model
//type VulcanFieldSelector<TModel = any> = {
//  [
//    fieldName: string /*in Exclude<
//    keyof TModel,
//    VulcanPossibleConditions | VulcanPossibleOperators // field cannot be _gte, _and, etc.
//  >*/
//  ]: VulcanInnerSelector<TModel> | string | number | null | boolean; // can be a primirive value as well
//} & { [key in VulcanPossibleConditions]?: never } &
//  { [key in VulcanPossibleOperators]?: never };

// Inner selector = field selector, operators and also conditions
// type VulcanInnerSelector<TModel = any> = VulcanSelector<TModel> &
//   VulcanConditionSelector; // nested selector also allow conditions { foobar: { _gt: 2}}

/**
 * Combination of field selectors, conditions and operators
 * { _and: [{size:2}, {name: "hello"}], bar: 3}
 */

export type VulcanSelector<TModel = any> =
  | FieldSelector<TModel>
  | OperatorSelector<TModel>;

// Minimum API for filter function
export interface FilterableInput<TModel = any> {
  id?: string;
  filter?: VulcanSelector<TModel>;
  sort?: { [fieldName in keyof TModel]?: VulcanSelectorSortOption };
  limit?: number;
  search?: string;
  offset?: number;
}
