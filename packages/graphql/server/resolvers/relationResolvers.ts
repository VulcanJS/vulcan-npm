import { VulcanDocument } from "@vulcanjs/schema";
import { RelationDefinition } from "../../typings";
import { getModel, getModelConnector } from "./context";
/*

Default Relation Resolvers

*/
import { restrictViewableFields } from "../../permissions";
import { QueryResolver } from "../typings";

interface RelationInput {
  // The initial field name (fooId)
  fieldName: string;
  // The relation (resolved field name and type)
  relation: RelationDefinition;
}

export const hasOne = ({
  fieldName,
  relation,
}: RelationInput): QueryResolver => async (document, args, context) => {
  // if document doesn't have a "foreign key" field, return null
  if (!document[fieldName]) return null;
  const documentId = document[fieldName];
  // get related collection
  // get related document
  const relatedModel = getModel(context, relation.typeName);
  const relatedDocument = await getModelConnector(
    context,
    relatedModel
  ).findOneById(documentId);
  // filter related document to restrict viewable fields
  return restrictViewableFields(
    context.currentUser,
    relatedModel,
    relatedDocument
  ) as VulcanDocument;
};

export const hasMany = ({
  fieldName,
  relation,
}: RelationInput): QueryResolver => async (document, args, context) => {
  // if document doesn't have a "foreign key" field, return null
  if (!document[fieldName]) return null;
  const documentId = document[fieldName];
  // get related collection
  // get related documents
  const relatedModel = getModel(context, relation.typeName);
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
