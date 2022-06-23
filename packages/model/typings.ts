import { VulcanDocument, VulcanSchema } from "@vulcanjs/schema";

type FilterFunction = (args: {
  input: any;
  context: any;
  filterArguments: any;
}) => { selector: Object; options: Object };

interface CanReadInput {
  user: any;
  document: any;
  model: VulcanModel;
  context: any;
  operationName: string; // "foobar.read.multi";
}
export type CanReadFunction = (input: CanReadInput) => boolean;
type ArrayOrSingle<T> = Array<T> | T;
// TODO: get those typings from a shared permission package (they are currently already defined in vulcan:graphql package but we can't import it here
// to avoid a circular dependency)
type GroupName = string;

export type PermissionChecker = (options: {
  document?: VulcanDocument | null;
  /**
   * NOTE: vulcan/permissions depends on VulcanModel so the type
   * cannot be VulcanUser. We should either expose VulcanUser from vulcan/model directly
   * or keep it as is
   *
   * Or maybe "permissions" should extend vulcan/model with the permissions field
   */
  user?: (VulcanDocument & { groups: Array<GroupName> }) | null;
  /** Request context, will only exist server-side */
  context?: any;
  /** Request context, will only exist server-side */
  operationName?: string;
}) => boolean;
export interface ModelMutationPermissionsOptions {
  canCreate?: PermissionChecker | ArrayOrSingle<GroupName>;
  canUpdate?: PermissionChecker | ArrayOrSingle<GroupName>;
  canDelete?: PermissionChecker | ArrayOrSingle<GroupName>;
}
export interface ModelQueryPermissionsOptions {
  canRead?: CanReadFunction | ArrayOrSingle<GroupName>;
}
/**
 * Permission for a model
 */
export interface ModelPermissionsOptions
  extends ModelMutationPermissionsOptions,
    ModelQueryPermissionsOptions {}

/**
 * Vulcan model, generated by the createModel function based on a schema and some options
 */
export interface VulcanModel<TSchema = VulcanSchema> {
  name: string;
  //customFilters: Array<{ name: string; filter: FilterFunction }>;
  description?: string;
  schema: TSchema; // NOTE: the right type might be "Evalutated Schema" if we use new SimpleSchema(mySchema)._schema to get it
  permissions: ModelPermissionsOptions;
}
