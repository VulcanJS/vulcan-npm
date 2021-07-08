/*

Default mutations

*/

import { createMutator, updateMutator, deleteMutator } from "./mutators";
import { getModel, getModelConnector } from "./context";
import { throwError } from "./errors";

import { ContextWithUser } from "./typings";
import { VulcanDocument } from "@vulcanjs/schema";
import { MutationResolverDefinitions } from "../typings";
import { VulcanGraphqlModel } from "../../typings";

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


interface MutationOptions {
  create?: boolean;
  update?: boolean;
  upsert?: boolean;
  delete?: boolean;
}
interface BuildDefaultMutationResolversInput {
  typeName: string;
  options?: MutationOptions;
}

interface GetDocumentSelectorInput {
  // TODO: put in common with the single resolver variables type, that have the same fields
  variables: {
    _id: string;
    input?: any; // SingleInput
  };
  model: VulcanGraphqlModel;
  context: any;
}

const getDocumentSelector = async ({
  variables,
  model,
  context,
}: GetDocumentSelectorInput): Promise<{ selector: Object; }> => {
  const { _id, input } = variables;
  let selector ;
  // _id bypass input so we return an empty object
  if (_id) {
    return { selector }
  }
  
  const connector = getModelConnector(context, model);
  const filterParameters = await connector._filter(input, context);
  selector = filterParameters.selector;
  return { selector };
};

/* // get a single document based on the mutation params
const getMutationDocument = async ({
  variables,
  model,
  context,
}: GetDocumentSelectorInput): Promise<{
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
    const filterParameters = await connector._filter(input, context);
    selector = filterParameters.selector;
    // get entire unmodified document from database
    document = await connector.findOne(selector);
  }
  return { selector, document };
}; */

/*

Default Mutations

*/
export function buildDefaultMutationResolvers({
  typeName,
  options,
}: BuildDefaultMutationResolversInput): MutationResolverDefinitions {
  const mutationOptions: MutationOptions = {
    ...defaultOptions,
    ...(options || {}),
  };

  const mutations: Partial<MutationResolverDefinitions> = {};

  if (mutationOptions.create) {
    mutations.create = {
      description: `Mutation for creating new ${typeName} documents`,
      name: getCreateMutationName(typeName),
      async mutation(root, { input: { data } }, context: ContextWithUser) {
        const model = getModel(context, typeName);

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
      async mutation(root, { input }, context: ContextWithUser) {
        const model = getModel(context, typeName);
        const data = input.data;
        const _id = input.id || (data && typeof data === "object" && data._id); // use provided id or documentId if available

        const { selector } = await getDocumentSelector({
          variables: {
            input,
            _id,
          },
          model,
          context,
        });

        // call editMutator boilerplate function
        return await updateMutator({
          model,
          selector,
          data,
          dataId: _id,
          currentUser: context.currentUser,
          validate: true,
          context,
        });
      },
    };
  }

  // if (mutationOptions.delete) {
  //   mutations.delete = {
  //     description: `Mutation for deleting a ${typeName} document`,
  //     name: getDeleteMutationName(typeName),
  //     async mutation(root, { input, _id }, context) {
  //       const model = getModel(context, typeName);
  //       const { currentUser } = context;

  //       let document ;
  //       const { document /*selector*/ } = await getMutationDocument({
  //         variables: {
  //           input,
  //           _id,
  //         },
  //         model,
  //         context,
  //       });

  //       performMutationCheck({
  //         user: currentUser,
  //         document,
  //         model,
  //         context,
  //         operationName: "delete",
  //       });
  //       if (!document?._id)
  //         throw new Error(
  //           "Perform mutation check did not catch an empty document._id during a delete mutation"
  //         ); // should not happen with the check, defnesive code

  //       return await deleteMutator({
  //         model,
  //         selector: { _id: document._id },
  //         currentUser: context.currentUser,
  //         validate: true,
  //         context,
  //         // document,
  //       });
  //     },
  //   };
  // }

  return mutations;
}
