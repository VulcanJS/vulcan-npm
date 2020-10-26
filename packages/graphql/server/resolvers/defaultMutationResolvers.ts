/*

Default mutations

*/

import { createMutator, updateMutator, deleteMutator } from "./mutators";
import { getModelConnector } from "./connectors.js";
import { throwError } from "./errors";

import { ContextWithUser } from "./typings";
import { ModelMutationPermissionOptions } from "@vulcanjs/model";
import { VulcanDocument } from "@vulcanjs/schema";
import { MutationResolverDefinitions } from "../typings";
import { VulcanGraphqlModel } from "../../typings.js";

const defaultOptions = {
  create: true,
  update: true,
  upsert: true,
  delete: true,
};

const getCreateMutationName = (typeName) => `create${typeName}`;
const getUpdateMutationName = (typeName) => `update${typeName}`;
const getDeleteMutationName = (typeName) => `delete${typeName}`;
const getUpsertMutationName = (typeName) => `upsert${typeName}`;

type OperationName = "create" | "update" | "delete";
const operationChecks: {
  [operationName in OperationName]: keyof ModelMutationPermissionOptions;
} = {
  create: "canCreate",
  update: "canUpdate",
  delete: "canDelete",
};

interface MutationCheckOptions {
  user: any;
  document: VulcanDocument;
  model: VulcanGraphqlModel;
  context: any;
  operationName: OperationName;
}
/*

Perform security check before calling mutators

*/
export const performMutationCheck = (options: MutationCheckOptions) => {
  const { user, document, model, context, operationName } = options;
  const { typeName } = model.graphql;
  const { Users } = context;
  const documentId = document._id;
  const permissionsCheck = model.permissions?.[operationChecks[operationName]];
  let allowOperation = false;
  const fullOperationName = `${typeName}:${operationName}`;
  const data = { documentId, operationName: fullOperationName };

  // 1. if no permission has been defined, throw error
  if (!permissionsCheck) {
    throwError({ id: "app.no_permissions_defined", data });
  }
  // 2. if no document is passed, throw error
  if (!document) {
    throwError({ id: "app.document_not_found", data });
  }

  if (typeof permissionsCheck === "function") {
    allowOperation = permissionsCheck(options);
  } else if (Array.isArray(permissionsCheck)) {
    allowOperation = Users.isMemberOf(user, permissionsCheck, document);
  }

  // 3. if permission check is defined but fails, disallow operation
  if (!allowOperation) {
    throwError({ id: "app.operation_not_allowed", data });
  }
};

interface MutationOptions {
  create?: boolean;
  update?: boolean;
  upsert?: boolean;
  delete?: boolean;
}
interface BuildDefaultMutationResolversInput {
  model: VulcanGraphqlModel;
  options: MutationOptions;
}

interface GetMutationDocumentInput {
  // TODO: put in common with the single resolver variables type, that have the same fields
  variables: {
    _id: string;
    input?: any; // SingleInput
  };
  model: VulcanGraphqlModel;
  context: any;
}

// get a single document based on the mutation params
const getMutationDocument = async ({
  variables,
  model,
  context,
}: GetMutationDocumentInput): Promise<{
  selector: Object;
  document?: VulcanDocument;
}> => {
  const connector = getModelConnector(context, model);
  let document;
  let selector;
  const { _id, input } = variables;
  if (_id) {
    // _id bypass input
    document = await connector.findOneById(_id);
  } else {
    const filterParameters = await connector.filter(model, input, context);
    selector = filterParameters.selector;
    // get entire unmodified document from database
    document = await connector.findOne(model, selector);
  }
  return { selector, document };
};
/*

Default Mutations

*/
export function buildDefaultMutationResolvers({
  model,
  options,
}: BuildDefaultMutationResolversInput): MutationResolverDefinitions {
  const { typeName } = model.graphql;

  const mutationOptions: MutationOptions = { ...defaultOptions, ...options };

  const mutations: Partial<MutationResolverDefinitions> = {};

  if (mutationOptions.create) {
    mutations.create = {
      description: `Mutation for creating new ${typeName} documents`,
      name: getCreateMutationName(typeName),
      async mutation(root, { data }, context: ContextWithUser) {
        const { currentUser } = context;

        performMutationCheck({
          user: currentUser,
          document: data,
          model,
          context,
          operationName: "create",
        });

        return await createMutator({
          model,
          data,
          currentUser: context.currentUser,
          validate: true,
          context,
        });
      },
    };
  }

  if (mutationOptions.update) {
    mutations.update = {
      description: `Mutation for updating a ${typeName} document`,
      name: getUpdateMutationName(typeName),
      async mutation(
        root,
        { input, _id: argsId, data },
        context: ContextWithUser
      ) {
        const { currentUser } = context;
        const _id = argsId || (data && typeof data === "object" && data._id); // use provided id or documentId if available

        const { document, selector } = await getMutationDocument({
          variables: {
            input,
            _id,
          },
          model,
          context,
        });

        performMutationCheck({
          user: currentUser,
          document,
          model,
          context,
          operationName: "update",
        });

        // call editMutator boilerplate function
        return await updateMutator({
          model,
          selector,
          data,
          currentUser: context.currentUser,
          validate: true,
          context,
          document,
        });
      },
    };
  }

  // TODO:
  // if (mutationOptions.upsert) {
  //   mutations.upsert = {
  //     description: `Mutation for upserting a ${typeName} document`,
  //     name: getUpsertMutationName(typeName),
  //     async mutation(root, { input, _id: argsId, data }, context) {
  //       const _id = argsId || (data && typeof data === "object" && data._id); // use provided id or documentId if available
  //
  //         // check if document exists already
  //         const {
  //           document: existingDocument,
  //           selector,
  //         } = await getMutationDocument({
  //           variables: { input, _id },
  //           model,
  //           context,
  //         });
  //
  //         if (existingDocument) {
  //           return await collection.options.mutations.update.mutation(
  //             root,
  //             { input, _id, selector, data },
  //             context
  //           );
  //         } else {
  //           return await collection.options.mutations.create.mutation(
  //             root,
  //             { data },
  //             context
  //           );
  //         }
  //       },
  //     };
  //   }

  if (mutationOptions.delete) {
    mutations.delete = {
      description: `Mutation for deleting a ${typeName} document`,
      name: getDeleteMutationName(typeName),
      async mutation(root, { input, _id }, context) {
        const { currentUser } = context;

        const { document /*selector*/ } = await getMutationDocument({
          variables: {
            input,
            _id,
          },
          model,
          context,
        });

        performMutationCheck({
          user: currentUser,
          document,
          model,
          context,
          operationName: "delete",
        });

        return await deleteMutator({
          model,
          selector: { _id: document._id },
          currentUser: context.currentUser,
          validate: true,
          context,
          document,
        });
      },
    };
  }

  return mutations;
}
