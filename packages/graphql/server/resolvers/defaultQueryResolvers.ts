/*

Default list, single, and total resolvers

Differences with Vulcan:
- no global connectors
Connectors are handled at an upper level, we expect the user to provide the right
data sources and connectors in the graphql context. So here we don't care whether the implemention
use Mongo or whatever

*/
import {
  canFilterDocument,
  checkFields,
  isMemberOf,
  restrictViewableFields,
} from "../../permissions";
import { VulcanGraphqlModel } from "../../typings";
import { QueryResolverDefinitions } from "../typings";
import { Connector, ContextWithUser } from "./typings";
import { getModelConnector } from "./context";
import debug from "debug";
import { VulcanDocument } from "@vulcanjs/schema";
import { getModel } from "./context";
const debugGraphql = debug("vulcan:graphql");

const defaultOptions = {
  cacheMaxAge: 300,
};

// TODO: check if we can unify with the corresponding hook typings
interface MultiInput {
  filter?: Object;
  sort?: Object;
  limit?: number;
  offset?: number;
  search?: string;
  _id?: string;
  enableCache?: boolean;
  enableTotal?: boolean;
}
interface MultiVariables {
  input: MultiInput;
}
// TODO: probably need to be shared with react multi hook
interface MultiResolverOutput<TModel> {
  totalCount?: number;
  results: Array<TModel>;
}
// note: for some reason changing resolverOptions to "options" throws error
interface BuildDefaultQueryResolversInput {
  typeName: string;
  options?: any;
}

interface SingleInput {
  enableCache?: boolean;
  allowNull?: boolean;
}
interface SingleVariables {
  _id?: string;
  input?: SingleInput;
}
interface SingleResolverOutput<TModel> {
  result: TModel;
}

/**
 * Expect
 * - context[typeName].model to contain the model (this way we don't need to have the model when we create the resolvers,
 * this solves the problem of circular dependency)
 * - context[typeName].connector to contain the connector for this model
 * @param param0
 */
export function buildDefaultQueryResolvers<TModel extends VulcanDocument>({
  typeName,
  options,
}: BuildDefaultQueryResolversInput): QueryResolverDefinitions {
  const resolverOptions = { ...defaultOptions, ...(options || {}) };

  const multi = {
    description: `A list of ${typeName} documents matching a set of query terms`,
    async resolver(
      root: any,
      { input = {} }: MultiVariables,
      context: ContextWithUser,
      { cacheControl }: any
    ): Promise<MultiResolverOutput<TModel>> {
      const model = context[typeName];
      const { enableCache = false, enableTotal = true } = input;
      const operationName = `${typeName}.read.multi`;

      if (cacheControl && enableCache) {
        const maxAge =
          resolverOptions.cacheMaxAge || defaultOptions.cacheMaxAge;
        cacheControl.setCacheHint({ maxAge });
      }

      const connector = getModelConnector(context, model);

      const { currentUser } = context;
      // get selector and options from terms and perform Mongo query

      let { selector, options } = await connector.filter(model, input, context);
      const filteredFields = Object.keys(selector);

      // make sure all filtered fields are allowed, before fetching the document
      // (ignore ambiguous field that will need the document to be checked)
      checkFields(currentUser, model, filteredFields);

      options.skip = input.offset;

      debugGraphql({ selector, options });

      const docs = await connector.find(model, selector, options);
      // in restrictViewableFields, null value will return {} instead of [] (because it works both for array and single doc)
      let viewableDocs = [];

      // check again if all fields used for filtering were actually allowed, this time based on actually retrieved documents

      // new API (Oct 2019)
      // TODO: use a reusable function instead
      const canRead = model.permissions.canRead;
      if (canRead) {
        if (typeof canRead === "function") {
          // if canRead is a function, use it to filter list of documents
          viewableDocs = docs.filter((doc) =>
            canRead({
              user: currentUser,
              document: doc,
              model,
              context,
              operationName,
            })
          );
        } else if (Array.isArray(canRead)) {
          // we need to check for property
          if (canRead.includes("owners")) {
            // if canReady array includes the owners group, test each document
            // to see if it's owned by the current user
            viewableDocs = docs.filter((doc) =>
              isMemberOf(currentUser, canRead as Array<string>, doc)
            );
          } else if (typeof canRead === "string") {
            // else, we don't need a per-document check and just allow or disallow
            // access to all documents at once
            viewableDocs = isMemberOf(currentUser, canRead as string)
              ? docs
              : [];
          }
        }
      }

      // check again that the fields used for filtering were all valid, this time based on documents
      // this second check is necessary for document based permissions like canRead:["owners", customFunctionThatNeedDoc]
      if (filteredFields.length) {
        viewableDocs = viewableDocs.filter((document) =>
          canFilterDocument(currentUser, model, filteredFields, document)
        );
      }

      // take the remaining documents and remove any fields that shouldn't be accessible
      const restrictedDocs = restrictViewableFields(
        currentUser,
        model,
        viewableDocs
      ) as TModel[]; // TODO: we should be able to infer if;

      // prime the cache
      // restrictedDocs.forEach((doc) => collection.loader.prime(doc._id, doc));

      const data: MultiResolverOutput<TModel> = { results: restrictedDocs };

      if (enableTotal) {
        // get total count of documents matching the selector
        data.totalCount = await connector.count(model, selector);
      } else {
        data.totalCount = null;
      }

      // return results
      return data;
    },
  };

  const single = {
    description: `A single ${typeName} document fetched by ID or slug`,

    async resolver(
      root,
      { input = {}, _id }: SingleVariables,
      context: ContextWithUser,
      { cacheControl }
    ): Promise<SingleResolverOutput<TModel>> {
      const {
        // selector: oldSelector = {},
        enableCache = false,
        allowNull = false,
      } = input;
      const operationName = `${typeName}.read.single`;
      //const { _id } = input; // _id is passed from the root
      let doc: VulcanDocument;

      if (cacheControl && enableCache) {
        const maxAge =
          resolverOptions.cacheMaxAge || defaultOptions.cacheMaxAge;
        cacheControl.setCacheHint({ maxAge });
      }

      const { currentUser } = context;
      const model = getModel(context, typeName);
      const connector: Connector<TModel> = getModelConnector(context, model);

      // use Dataloader if doc is selected by _id
      if (_id) {
        doc = await connector.findOneById(model, _id);
      } else {
        let { selector, options, filteredFields } = await connector.filter(
          model,
          input,
          context
        );
        // make sure all filtered fields are actually readable, for basic roles
        checkFields(currentUser, model, filteredFields);
        doc = await connector.findOne(model, selector, options);

        // check again that the fields used for filtering were all valid, this time based on retrieved document
        // this second check is necessary for document based permissions like canRead:["owners", customFunctionThatNeedDoc]
        if (filteredFields.length) {
          doc = canFilterDocument(currentUser, model, filteredFields, doc)
            ? doc
            : null;
        }
      }

      if (!doc) {
        if (allowNull) {
          return { result: null };
        } else {
          // TODO: figure out this
          const errorInfo = {
            id: "app.missing_document",
            data: { documentId: _id, input },
          };
          const error = new Error(errorInfo.id);
          (error as any).error = errorInfo;
          throw error;
        }
      }

      // new API (Oct 2019)
      let canReadFunction;
      const canRead = model.permissions?.canRead;
      if (canRead) {
        if (typeof canRead === "function") {
          // if canRead is a function, use it to check current document
          canReadFunction = canRead;
        } else if (Array.isArray(canRead)) {
          // else if it's an array of groups, check if current user belongs to them
          // for the current document
          canReadFunction = ({ user, document }) =>
            isMemberOf(user, canRead, document);
        }
      } else {
        // default to allowing access to all documents
        canReadFunction = () => true;
      }

      if (
        !canReadFunction({
          user: currentUser,
          document: doc,
          model,
          context,
          operationName,
        })
      ) {
        const errorInfo = {
          id: "app.operation_not_allowed",
          data: { documentId: doc._id, operationName },
        };
        const error = new Error(errorInfo.id);
        (error as any).error = errorInfo;
        throw error;
      }

      const restrictedDoc = restrictViewableFields(
        currentUser,
        model,
        doc
      ) as TModel;

      // filter out disallowed properties and return resulting document
      return { result: restrictedDoc };
    },
  };

  return {
    // resolver for returning a list of documents based on a set of query terms
    multi,
    // resolver for returning a single document queried based on id or slug
    single,
  };
}
