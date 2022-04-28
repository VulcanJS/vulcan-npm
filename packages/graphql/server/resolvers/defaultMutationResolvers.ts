/*

Default mutations

*/

import {
  createMutator,
  updateMutator,
  deleteMutator,
} from "@vulcanjs/crud/server";

import { ContextWithUser } from "./typings";
import { MutationResolverDefinitions } from "../typings";
import { getModel } from "../contextBuilder";

const defaultOptions = {
  create: true,
  update: true,
  upsert: true,
  delete: true,
};

const getCreateMutationName = (typeName) => `create${typeName}`;
const getUpdateMutationName = (typeName) => `update${typeName}`;
const getDeleteMutationName = (typeName) => `delete${typeName}`;
//const getUpsertMutationName = (typeName) => `upsert${typeName}`;

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
          // legacy, only the currentUser is actually needed (mutators won't use Apollo datasources)
          context,
        });
      },
    };
  }

  if (mutationOptions.update) {
    mutations.update = {
      description: `Mutation for updating a ${typeName} document`,
      name: getUpdateMutationName(typeName),
      /**
       * Example consumption from a hook:
       *
       * const [updateUser] = useUpdate({model: User})
       * updateUser({input: { data: { id: 42, newField: "hello" }}})
       *
       * @param root
       * @param param1
       * @param context
       * @returns
       */
      async mutation(root, { input }, context: ContextWithUser) {
        const model = getModel(context, typeName);
        return await updateMutator({
          model,
          input,
          currentUser: context.currentUser,
          validate: true,
          // legacy, only the currentUser is actually needed (mutators won't use Apollo datasources)
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
        return await deleteMutator({
          model,
          input,
          currentUser: context.currentUser,
          validate: true,
          // legacy, only the currentUser is actually needed (mutators won't use Apollo datasources)
          context,
        });
      },
    };
  }

  return mutations;
}
