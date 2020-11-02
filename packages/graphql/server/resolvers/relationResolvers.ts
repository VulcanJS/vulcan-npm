import { VulcanModel } from "@vulcanjs/model";
import { VulcanDocument } from "@vulcanjs/schema";
import { getModelConnector } from "./context";
/*

Default Relation Resolvers

*/
import { restrictViewableFields } from "../../permissions";

interface RelationResolverInput {
  document: VulcanDocument;
  fieldName: string;
  context: any;
  relatedModel: VulcanModel;
}
type RelationResolver = (input: RelationResolverInput) => VulcanDocument;

export const hasOne: RelationResolver = async ({
  document,
  fieldName,
  context,
  relatedModel,
}) => {
  // if document doesn't have a "foreign key" field, return null
  if (!document[fieldName]) return null;
  const documentId = document[fieldName];
  // get related collection
  // get related document
  const relatedDocument = await getModelConnector(
    context,
    relatedModel
  ).findOneById(relatedModel, documentId);
  // filter related document to restrict viewable fields
  return restrictViewableFields(
    context.currentUser,
    relatedModel,
    relatedDocument
  ) as VulcanDocument;
};

export const hasMany: RelationResolver = async ({
  document,
  fieldName,
  context,
  relatedModel,
}) => {
  // if document doesn't have a "foreign key" field, return null
  if (!document[fieldName]) return null;
  const documentId = document[fieldName];
  // get related collection
  // get related documents
  const relatedDocuments = await context[
    relatedModel.name
  ].connector.findOneById(documentId);
  // filter related document to restrict viewable fields
  return context.Users.restrictViewableFields(
    context.currentUser,
    relatedModel,
    relatedDocuments
  ) as Array<VulcanDocument>;
};
