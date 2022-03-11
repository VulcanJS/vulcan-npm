/**
 * Create a Vulcan model with graphql capabilities
 *
 * Implementation is based on an extension system
 *
 * End user is supposed to use only the "createGraphqlModel" function
 */
import {
  //VulcanGraphqlModel,
  MutationCallbackDefinitions,
  //VulcanGraphqlSchema,
  VulcanGraphqlModelServer,
  VulcanGraphqlSchemaServer,
} from "./typings";
import { VulcanModel, createModel, CreateModelOptions } from "@vulcanjs/model";
/*
import {
  getDefaultFragmentText,
  getDefaultFragmentName,
} from "./fragments/defaultFragment";
import { camelCaseify, Merge } from "@vulcanjs/utils";
*/
import {
  MutationResolverDefinitions,
  QueryResolverDefinitions,
} from "./server/typings";
import {
  buildDefaultMutationResolvers,
  buildDefaultQueryResolvers,
  formattedDateResolver,
} from "./server/resolvers";
// don't forget to reexport common code
export * from "./extendModel";
import extendModel, {
  GraphqlModelDefinition,
  GraphqlModelOptions,
} from "./extendModel";
import cloneDeep from "lodash/cloneDeep.js";
import isEmpty from "lodash/isEmpty.js";

import merge from "lodash/merge.js";
/**
 * This type is meant to be exposed server side
 *  @server-only
 */
export interface GraphqlModelOptionsServer extends GraphqlModelOptions {
  /** Custom query resolvers (single, multi). Set to "null" if you don't want Vulcan to set any resolvers. Leave undefined if you want to use default resolvers. */
  queryResolvers?: Partial<QueryResolverDefinitions> | null;
  /** Custom mutation resolvers (create, update, delete). Set to "null" if you don't want Vulcan to set any resolvers. Leave undefined if you want to use default resolvers. */
  mutationResolvers?: Partial<MutationResolverDefinitions> | null;
  callbacks?: MutationCallbackDefinitions;
}

/**
 * Add formattedDateResolver and other server specific fields
 * @param schema
 * @returns
 */
const extendSchemaServer = (
  schema: VulcanGraphqlSchemaServer
): VulcanGraphqlSchemaServer => {
  // if this is a date field, and fieldFormatted doesn't already exist in the schema
  // or as a resolveAs field, then add fieldFormatted to apiSchema
  // This code previously lived in "createSchema" function
  const extendedSchema = cloneDeep(schema);
  const apiSchema: any = {};
  Object.keys(schema).forEach((fieldName) => {
    const field = schema[fieldName];
    const { arrayItem, type, canRead } = field;
    const formattedFieldName = `${fieldName}Formatted`;
    if (Array.isArray(field.resolveAs)) return extendedSchema;
    if (
      type === Date &&
      !schema[formattedFieldName] &&
      // TODO: will work only if resolveAs is not an array
      field?.resolveAs?.fieldName !== formattedFieldName
    ) {
      // TODO: apiSchema typing is slightly different from normal schema, we need to figure this out
      apiSchema[formattedFieldName] = {
        typeName: "String",
        canRead,
        arguments: 'format: String = "YYYY/MM/DD"',
        resolver: formattedDateResolver(fieldName),
      };
    }
  });
  // if apiSchema contains fields, copy them over to main schema
  // TODO: we could do it in one stap now
  if (!isEmpty(apiSchema)) {
    Object.keys(apiSchema).forEach((fieldName) => {
      const field = apiSchema[fieldName];
      const { canRead = ["guests"], description, ...resolveAs } = field;
      extendedSchema[fieldName] = {
        type: Object,
        optional: true,
        apiOnly: true,
        canRead,
        description,
        resolveAs,
      };
    });
  }
  return extendedSchema;
};

/**
 * Plugin function that adds graphql options to a generic model,
 * including server-side fields
 *
 * NOTE: should not be used directly, prefer calling "createGraphqlModelServer"
 */
export const extendModelServer =
  (
    options: GraphqlModelOptionsServer
  ) /*: ExtendModelFunc<VulcanGraphqlModel>*/ =>
  (model: VulcanModel): VulcanGraphqlModelServer => {
    const extendedModel = extendModel(options)(model);
    const {
      mutationResolvers: mutationResolversFromOptions,
      queryResolvers: queryResolversFromOptions,
    } = options;
    let mutationResolvers = mutationResolversFromOptions,
      queryResolvers = queryResolversFromOptions;
    // NOTE: we use default only if the value is "undefined", if it is explicitely "null" we leave it empty (user will define resolvers manually)
    if (typeof mutationResolvers === "undefined") {
      mutationResolvers = buildDefaultMutationResolvers({
        typeName: extendedModel.graphql.typeName,
      });
    }
    if (typeof queryResolvers === "undefined") {
      queryResolvers = buildDefaultQueryResolvers({
        typeName: extendedModel.graphql.typeName,
      });
    }
    /**
     * If mutationResolvers and queryResolvers are not explicitely null,
     * use the default ones
     */
    const finalModel = extendedModel as VulcanGraphqlModelServer;
    finalModel.graphql = {
      ...extendedModel.graphql,
      mutationResolvers: mutationResolvers ? mutationResolvers : undefined,
      queryResolvers: queryResolvers ? queryResolvers : undefined,
    };
    finalModel.schema = extendSchemaServer(finalModel.schema);
    const name = model.name;
    return finalModel;
  };

export interface CreateGraphqlModelOptionsServer
  extends CreateModelOptions<VulcanGraphqlSchemaServer> {
  graphql: GraphqlModelOptionsServer;
}
/**
 * Server-side definition of a model
 */
export type GraphqlModelDefinitionServer = CreateGraphqlModelOptionsServer;

/**
 * Create a graphql model, accepting server-options
 * @server-only
 */
export const createGraphqlModelServer = (
  options: CreateGraphqlModelOptionsServer
): VulcanGraphqlModelServer => {
  // TODO:
  const { graphql, ...baseOptions } = options;
  const model = createModel({
    ...baseOptions,
    extensions: [extendModelServer(options.graphql)],
  }) as VulcanGraphqlModelServer;
  return model;
};

/**
 * Adds server only options to a model
 * @param fullModelDef
 * @param extensionModelDef
 * @returns
 */
export const mergeModelDefinitionServer = (
  fullModelDef: GraphqlModelDefinition,
  /**
   * Partial model definition, adding some server-only options to an existing model
   */
  extensionModelDef: Omit<Partial<GraphqlModelDefinitionServer>, "graphql"> & {
    graphql?: Partial<GraphqlModelDefinitionServer["graphql"]>;
  }
) => {
  return merge({}, fullModelDef, extensionModelDef);
};

/**
 */

//// CODE FROM CREATE COLLECTION
//import { Mongo } from "meteor/mongo";
//import SimpleSchema from "simpl-schema";
// import escapeStringRegexp from "escape-string-regexp";
// import {
//   validateIntlField,
//   getIntlString,
//   isIntlField,
//   schemaHasIntlFields,
//   schemaHasIntlField,
// } from "./intl";
// import clone from "lodash/clone.js";
// import isEmpty from "lodash/isEmpty.js";
// import merge from "lodash/merge.js";
// import _omit from "lodash/omit.js";
// import mergeWith from "lodash/mergeWith.js";
// import { createSchema, isCollectionType } from "./schema_utils";

// // will be set to `true` if there is one or more intl schema fields
// export let hasIntlFields = false;

// // see https://github.com/dburles/meteor-collection-helpers/blob/master/collection-helpers.js
// Mongo.Collection.prototype.helpers = function (helpers) {
//   var self = this;

//   if (self._transform && !self._helpers)
//     throw new Meteor.Error(
//       "Can't apply helpers to '" +
//         self._name +
//         "' a transform function already exists!"
//     );

//   if (!self._helpers) {
//     self._helpers = function Document(doc) {
//       return Object.assign(this, doc);
//     };
//     self._transform = function (doc) {
//       return new self._helpers(doc);
//     };
//   }

//   Object.keys(helpers).forEach(function (key) {
//     self._helpers.prototype[key] = helpers[key];
//   });
// };

// export const extendCollection = (collection, options) => {
//   const newOptions = mergeWith({}, collection.options, options, (a, b) => {
//     if (Array.isArray(a) && Array.isArray(b)) {
//       return a.concat(b);
//     }
//     if (Array.isArray(a) && b) {
//       return a.concat([b]);
//     }
//     if (Array.isArray(b) && a) {
//       return b.concat([a]);
//     }
//   });
//   collection = createCollection(newOptions);
//   return collection;
// };

// /*

// Note: this currently isn't used because it would need to be called
// after all collections have been initialized, otherwise we can't figure out
// if resolved field is resolving to a collection type or not

// */
// export const addAutoRelations = () => {
//   Collections.forEach((collection) => {
//     const schema = collection.simpleSchema()._schema;
//     // add "auto-relations" to schema resolvers
//     Object.keys(schema).map((fieldName) => {
//       const field = schema[fieldName];
//       // if no resolver or relation is provided, try to guess relation and add it to schema
//       if (field.resolveAs) {
//         const { resolver, relation, type } = field.resolveAs;
//         if (isCollectionType(type) && !resolver && !relation) {
//           field.resolveAs.relation =
//             field.type === Array ? "hasMany" : "hasOne";
//         }
//       }
//     });
//   });
// };

// /*

// Pass an existing collection to overwrite it instead of creating a new one

// */
// export const createCollection = (options) => {
//   const {
//     typeName,
//     collectionName = generateCollectionNameFromTypeName(typeName),
//     dbCollectionName,
//   } = options;
//   let { schema, apiSchema, dbSchema } = options;

//   // decorate collection with options
//   collection.options = options;

//   // add views
//   collection.views = [];

//   //register individual collection callback
//   registerCollectionCallback(typeName.toLowerCase());

//   // if schema has at least one intl field, add intl callback just before
//   // `${collectionName}.collection` callbacks run to make sure it always runs last
//   if (schemaHasIntlFields(schema)) {
//     hasIntlFields = true; // we have at least one intl field
//     addCallback(`${typeName.toLowerCase()}.collection`, addIntlFields);
//   }

//   if (schema) {
//     // attach schema to collection
//     collection.attachSchema(createSchema(schema, apiSchema, dbSchema));
//   }

//   // ------------------------------------- Default Fragment -------------------------------- //

//   const defaultFragment = getDefaultFragmentText(collection);
//   if (defaultFragment) registerFragment(defaultFragment);

//   // ------------------------------------- Parameters -------------------------------- //

//   // legacy
//   collection.getParameters = (terms = {}, apolloClient, context) => {
//     // console.log(terms);

//     const currentSchema = collection.simpleSchema()._schema;

//     let parameters = {
//       selector: {},
//       options: {},
//     };

//     if (collection.defaultView) {
//       parameters = Utils.deepExtend(
//         true,
//         parameters,
//         collection.defaultView(terms, apolloClient, context)
//       );
//     }

//     // handle view option
//     if (terms.view && collection.views[terms.view]) {
//       const viewFn = collection.views[terms.view];
//       const view = viewFn(terms, apolloClient, context);
//       let mergedParameters = Utils.deepExtend(true, parameters, view);

//       if (
//         mergedParameters.options &&
//         mergedParameters.options.sort &&
//         view.options &&
//         view.options.sort
//       ) {
//         // If both the default view and the selected view have sort options,
//         // don't merge them together; take the selected view's sort. (Otherwise
//         // they merge in the wrong order, so that the default-view's sort takes
//         // precedence over the selected view's sort.)
//         mergedParameters.options.sort = view.options.sort;
//       }
//       parameters = mergedParameters;
//     }

//     // iterate over posts.parameters callbacks
//     parameters = runCallbacks(
//       `${typeName.toLowerCase()}.parameters`,
//       parameters,
//       clone(terms),
//       apolloClient,
//       context
//     );
//     // OpenCRUD backwards compatibility
//     parameters = runCallbacks(
//       `${collectionName.toLowerCase()}.parameters`,
//       parameters,
//       clone(terms),
//       apolloClient,
//       context
//     );

//     if (Meteor.isClient) {
//       parameters = runCallbacks(
//         `${typeName.toLowerCase()}.parameters.client`,
//         parameters,
//         clone(terms),
//         apolloClient
//       );
//       // OpenCRUD backwards compatibility
//       parameters = runCallbacks(
//         `${collectionName.toLowerCase()}.parameters.client`,
//         parameters,
//         clone(terms),
//         apolloClient
//       );
//     }

//     // note: check that context exists to avoid calling this from withList during SSR
//     if (Meteor.isServer && context) {
//       parameters = runCallbacks(
//         `${typeName.toLowerCase()}.parameters.server`,
//         parameters,
//         clone(terms),
//         context
//       );
//       // OpenCRUD backwards compatibility
//       parameters = runCallbacks(
//         `${collectionName.toLowerCase()}.parameters.server`,
//         parameters,
//         clone(terms),
//         context
//       );
//     }

//     // sort using terms.orderBy (overwrite defaultView's sort)
//     if (terms.orderBy && !isEmpty(terms.orderBy)) {
//       parameters.options.sort = terms.orderBy;
//     }

//     // if there is no sort, default to sorting by createdAt descending
//     if (!parameters.options.sort) {
//       parameters.options.sort = { createdAt: -1 };
//     }

//     // extend sort to sort posts by _id to break ties, unless there's already an id sort
//     // NOTE: always do this last to avoid overriding another sort
//     //if (!(parameters.options.sort && parameters.options.sort._id)) {
//     //  parameters = Utils.deepExtend(true, parameters, { options: { sort: { _id: -1 } } });
//     //}

//     // remove any null fields (setting a field to null means it should be deleted)
//     Object.keys(parameters.selector).forEach((key) => {
//       if (parameters.selector[key] === null) delete parameters.selector[key];
//     });
//     if (parameters.options.sort) {
//       Object.keys(parameters.options.sort).forEach((key) => {
//         if (parameters.options.sort[key] === null)
//           delete parameters.options.sort[key];
//       });
//     }

//     if (terms.query) {
//       const query = escapeStringRegexp(terms.query);
//       const searchableFieldNames = Object.keys(currentSchema).filter(
//         (fieldName) => currentSchema[fieldName].searchable
//       );
//       if (searchableFieldNames.length) {
//         parameters = Utils.deepExtend(true, parameters, {
//           selector: {
//             $or: searchableFieldNames.map((fieldName) => ({
//               [fieldName]: { $regex: query, $options: "i" },
//             })),
//           },
//         });
//       } else {
//         // eslint-disable-next-line no-console
//         console.warn(
//           `Warning: terms.query is set but schema ${collection.options.typeName} has no searchable field. Set "searchable: true" for at least one field to enable search.`
//         );
//       }
//     }

//     // limit number of items to 1000 by default
//     const maxDocuments = getSetting("maxDocumentsPerRequest", 1000);
//     const limit = terms.limit || parameters.options.limit;
//     parameters.options.limit =
//       !limit || limit < 1 || limit > maxDocuments ? maxDocuments : limit;

//     // console.log(JSON.stringify(parameters, 2));

//     return parameters;
//   };

//   if (existingCollection) {
//     Collections[existingCollectionIndex] = existingCollection;
//   } else {
//     Collections.push(collection);
//   }

//   return collection;
// };

// //register collection creation hook for each collection
// function registerCollectionCallback(typeName) {
//   registerCallback({
//     name: `${typeName}.collection`,
//     iterator: { schema: "the schema of the collection" },
//     properties: [
//       { schema: "The schema of the collection" },
//       {
//         validationErrors:
//           "An Object that can be used to accumulate validation errors",
//       },
//     ],
//     runs: "sync",
//     returns: "schema",
//     description: "Modifies schemas on collection creation",
//   });
// }

// //register colleciton creation hook
// registerCallback({
//   name: "*.collection",
//   iterator: { schema: "the schema of the collection" },
//   properties: [
//     { schema: "The schema of the collection" },
//     {
//       validationErrors:
//         "An object that can be used to accumulate validation errors",
//     },
//   ],
//   runs: "sync",
//   returns: "schema",
//   description: "Modifies schemas on collection creation",
// });

// // generate foo_intl fields
// export function addIntlFields(schema) {
//   Object.keys(schema).forEach((fieldName) => {
//     const fieldSchema = schema[fieldName];
//     if (isIntlField(fieldSchema) && !schemaHasIntlField(schema, fieldName)) {
//       // remove `intl` to avoid treating new _intl field as a field to internationalize
//       // eslint-disable-next-line no-unused-vars
//       const { intl, ...propertiesToCopy } = schema[fieldName];

//       schema[`${fieldName}_intl`] = {
//         ...propertiesToCopy, // copy properties from regular field
//         hidden: true,
//         type: Array,
//         isIntlData: true,
//       };

//       delete schema[`${fieldName}_intl`].intl;

//       schema[`${fieldName}_intl.$`] = {
//         type: getIntlString(),
//       };

//       // if original field is required, enable custom validation function instead of `optional` property
//       if (!schema[fieldName].optional) {
//         schema[`${fieldName}_intl`].optional = true;
//         schema[`${fieldName}_intl`].custom = validateIntlField;
//       }

//       // make original non-intl field optional
//       schema[fieldName].optional = true;
//     }
//   });
//   return schema;
// }

export default extendModel;
