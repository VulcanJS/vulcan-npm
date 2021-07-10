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
  variables: {
    _id?: string;
    input: any; // SingleInput
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
  let selector;
  // if there's an Id, just return it without looking at the input
  if (_id) {
    return { selector: { _id } }
  }

  const connector = getModelConnector(context, model);
  const filterParameters = await connector._filter(input, context);
  selector = filterParameters.selector;
  return { selector };
};

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
          currentUser: context.currentUser,
          validate: true,
          context,
        });
      },
    };
  }

  if (mutationOptions.delete) {
    mutations.delete = {
      description: `Mutation for deleting a ${typeName} document`,
      name: getDeleteMutationName(typeName),
      async mutation(root, { input }, context) {
        const model = getModel(context, typeName);

        const { selector } = await getDocumentSelector({
          variables: {
            input
          },
          model,
          context,
        });

        return await deleteMutator({
          model,
          selector,
          currentUser: context.currentUser,
          validate: true,
          context,
        });
      },
    };
  }

  return mutations;
}
