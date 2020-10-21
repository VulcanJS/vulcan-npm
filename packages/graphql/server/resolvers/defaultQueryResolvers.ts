/*

Default list, single, and total resolvers

Differences with Vulcan:
- no global connectors
Connectors are handled at an upper level, we expect the user to provide the right
data sources and connectors in the graphql context. So here we don't care whether the implemention
use Mongo or whatever

*/
import get from "lodash/get";
import {
  canFilterDocument,
  checkFields,
  isMemberOf,
  restrictViewableFields,
} from "../../permissions.js";
import { VulcanGraphqlModel } from "../../typings.js";
import { QueryResolverDefinitions } from "../typings.js";
import { getModelConnector } from "./connectors.js";
import { Connector } from "./typings";
import debug from "debug";
import { VulcanDocument } from "@vulcanjs/schema";
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
// TODO: probably need to be shared with react multi hook
interface MultiResolverOutput<TModel> {
  totalCount?: number;
  results: Array<TModel>;
}
interface MultiVariables {
  input: MultiInput;
}
// note: for some reason changing resolverOptions to "options" throws error
interface BuildDefaultQueryResolversInput {
  model: VulcanGraphqlModel;
  options: any;
}

interface ContextWithUser {
  currentUser: any;
  [key: string]: any;
}
export function buildDefaultQueryResolvers<TModel extends VulcanDocument>({
  model,
  options,
}: BuildDefaultQueryResolversInput): QueryResolverDefinitions {
  const resolverOptions = { ...defaultOptions, ...options };
  const { typeName } = model.graphql;

  const multi = {
    description: `A list of ${typeName} documents matching a set of query terms`,
    async resolver(
      root: any,
      { input = {} }: MultiVariables,
      context: ContextWithUser,
      { cacheControl }: any
    ): Promise<MultiResolverOutput<TModel>> {
      const { enableCache = false, enableTotal = true } = input;
      const operationName = `${typeName}.read.multi`;

      if (cacheControl && enableCache) {
        const maxAge =
          resolverOptions.cacheMaxAge || defaultOptions.cacheMaxAge;
        cacheControl.setCacheHint({ maxAge });
      }

      // get currentUser and Users collection from context

      // get collection based on collectionName argument
      const connector: Connector<TModel> = getModelConnector(context, model);

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

      debugGraphql(
        `\x1b[33m=> ${restrictedDocs.length} documents returned\x1b[0m`
      );
      debugGraphql(
        `--------------- end \x1b[35m${typeName} Multi Resolver\x1b[0m ---------------`
      );

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

    async resolver(root, { input = {}, _id }, context, { cacheControl }) {
      const {
        selector: oldSelector = {},
        enableCache = false,
        allowNull = false,
      } = input;
      const operationName = `${typeName}.read.single`;
      //const { _id } = input; // _id is passed from the root
      let doc;

      debug("");
      debugGroup(
        `--------------- start \x1b[35m${typeName} Single Resolver\x1b[0m ---------------`
      );
      debug(`Options: ${JSON.stringify(resolverOptions)}`);
      debug(`Selector: ${JSON.stringify(oldSelector)}`);

      if (cacheControl && enableCache) {
        const maxAge =
          resolverOptions.cacheMaxAge || defaultOptions.cacheMaxAge;
        cacheControl.setCacheHint({ maxAge });
      }

      const { currentUser, Users } = context;
      const collection = context[collectionName];

      // use Dataloader if doc is selected by _id
      if (_id) {
        doc = await collection.loader.load(_id);
      } else {
        let { selector, options, filteredFields } = await Connectors.filter(
          collection,
          input,
          context
        );
        // make sure all filtered fields are actually readable, for basic roles
        Users.checkFields(currentUser, collection, filteredFields);
        doc = await Connectors.get(collection, selector, options);

        // check again that the fields used for filtering were all valid, this time based on retrieved document
        // this second check is necessary for document based permissions like canRead:["owners", customFunctionThatNeedDoc]
        if (filteredFields.length) {
          doc = Users.canFilterDocument(
            currentUser,
            collection,
            filteredFields,
            doc
          )
            ? doc
            : null;
        }
      }

      if (!doc) {
        if (allowNull) {
          return { result: null };
        } else {
          throwError({
            id: "app.missing_document",
            data: { documentId: _id, input },
          });
        }
      }

      // new API (Oct 2019)
      let canReadFunction;
      const canRead = get(collection, "options.permissions.canRead");
      if (canRead) {
        if (typeof canRead === "function") {
          // if canRead is a function, use it to check current document
          canReadFunction = canRead;
        } else if (Array.isArray(canRead)) {
          // else if it's an array of groups, check if current user belongs to them
          // for the current document
          canReadFunction = ({ user, document }) =>
            Users.isMemberOf(user, canRead, document);
        }
      } else {
        // default to allowing access to all documents
        canReadFunction = () => true;
      }

      if (
        !canReadFunction({
          user: currentUser,
          document,
          collection,
          context,
          operationName,
        })
      ) {
        throwError({
          id: "app.operation_not_allowed",
          data: { documentId: document._id, operationName },
        });
      }

      const restrictedDoc = Users.restrictViewableFields(
        currentUser,
        collection,
        doc
      );

      debugGroupEnd();
      debug(
        `--------------- end \x1b[35m${typeName} Single Resolver\x1b[0m ---------------`
      );
      debug("");

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
