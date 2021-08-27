import { VulcanDocument } from "@vulcanjs/schema";
import { RelationDefinition } from "../../typings";
import { getModel, getModelConnector } from "./context";
/*

Default Relation Resolvers

*/
import { restrictViewableFields } from "@vulcanjs/permissions";
import { QueryResolver } from "../typings";

interface RelationInput {
  // The initial field name (fooId)
  fieldName: string;
  // The relation (resolved field name and type)
  relation: RelationDefinition;
}

/**
 * Fetch one related document
 * @returns null if document is not found (no error,
 * contrary to how single resolve work, we are more tolerant)
 * or the related document
 */
export const hasOne =
  ({ fieldName, relation }: RelationInput): QueryResolver =>
  async (document, args, context) => {
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
    if (!relatedDocument) return null;
    // filter related document to restrict viewable fields
    return restrictViewableFields(
      context.currentUser,
      relatedModel,
      relatedDocument
    ) as VulcanDocument;
  };

// TODO: this probably don't work
export const hasMany =
  ({ fieldName, relation }: RelationInput): QueryResolver =>
  async (document, args, context) => {
    // if document doesn't have a "foreign key" field, return null
    const documentIds = document[fieldName];
    if (!documentIds) return null;
    if (!documentIds.length) return [];
    // get related collection
    // get related documents
    const relatedModel = getModel(context, relation.typeName);
    const connector = context[relatedModel.name];
    const input = { _id: { $in: documentIds } };
    let { selector } = await connector._filter(input, context);
    const relatedDocuments = await connector.find(selector);
    // filter related document to restrict viewable fields
    return context.Users.restrictViewableFields(
      context.currentUser,
      relatedModel,
      relatedDocuments
    ) as Array<VulcanDocument>;
  };
