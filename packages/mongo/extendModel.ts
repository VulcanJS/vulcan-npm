/**
 */
import { VulcanModel, ExtendModelFunc } from "@vulcanjs/model";

interface MongoModel {
  collectionName: string;
}
export interface VulcanMongoModel extends VulcanModel {
  mongo: MongoModel;
}

interface CreateModelSharedOptions {}
interface CreateModelServerOptions {
  collectionName: string;
}
interface CreateModelOptions
  extends CreateModelSharedOptions,
    CreateModelServerOptions {}
export const extendModel =
  (options: CreateModelOptions) /*: ExtendModelFunc<VulcanGraphqlModel>*/ =>
  (model: VulcanModel): VulcanMongoModel => {
    const { collectionName } = options; // TODO?
    // compute default fragment
    const extendedModel = {
      ...model,
      mongo: { collectionName },
    };
    const finalModel: VulcanMongoModel = {
      ...extendedModel,
    };
    return finalModel;
  };

export default extendModel;
