import { convertToJSON } from "@vulcanjs/crud/server";
import { VulcanDocument } from "@vulcanjs/schema";
import { RelationDefinition, VulcanGraphqlFieldSchema } from "../../typings";
/*

Default Relation Resolvers

*/
import { restrictViewableFields } from "@vulcanjs/permissions";
import { QueryResolver } from "../typings";
import {
  getModelDataSource,
  getModel,
  getModelConnector,
} from "../contextBuilder";

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
  async (document: VulcanDocument, args: any, context) => {
    // if document doesn't have a "foreign key" field, return null
    if (!document[fieldName]) return null;
    const documentId = document[fieldName];
    // get related collection
    // get related document
    const relatedModel =
      "model" in relation
        ? relation.model
        : getModel(context, relation.typeName);

    let relatedDocument: VulcanDocument | null = null;
    try {
      // Using a dataSource is necessary to avoid the N+1 problem
      // when resolving the relation field for an array of item
      // (EG get address of N users)
      const dt = getModelDataSource(context, relatedModel);
      const rawDocument = await dt.findOneById(documentId);
      // DataSource will provide _id as an ObjectId, we want to conver them to string _id first
      if (rawDocument) {
        relatedDocument = convertToJSON(rawDocument);
      }
    } catch (err) {
      console.warn(
        "Could not retrieve related document using a DataSource, error:",
        err
      );
      console.warn(
        "Will use the default connector instead, but it may lead to performance issue related to the 'N+1' problem."
      );
      const connector = getModelConnector(context, relatedModel);
      relatedDocument = await connector.findOneById(documentId);
    }

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
    const relatedModel =
      "model" in relation
        ? relation.model
        : getModel(context, relation.typeName);

    let relatedDocuments: Array<VulcanDocument> = [];
    try {
      const dt = getModelDataSource(context, relatedModel);
      const rawDocuments = await dt.findManyByIds(documentIds);
      if (rawDocuments) {
        relatedDocuments = convertToJSON(rawDocuments);
      }
    } catch (err) {
      console.warn(
        "Could not retrieve related document using a DataSource, error:",
        err
      );
      console.warn(
        "Will use the default connector instead, but it may lead to performance issue related to the 'N+1' problem."
      );
      const connector = getModelConnector(context, relatedModel);
      const input = { filter: { _id: { _in: documentIds } } };
      let { selector } = await connector._filter(input, context);
      relatedDocuments = await connector.find(selector);
    }
    // filter related document to restrict viewable fields
    return restrictViewableFields(
      context.currentUser,
      relatedModel,
      relatedDocuments
    ) as Array<VulcanDocument>;
  };

/**
 * Reversed relation: resolve a Bar from a Foo,
 * but based on Bar.fooId (instead of Foo.barId)
 * @param document
 * @param args
 * @param ctx
 */
export const reversed = ({
  fieldName,
  reversedRelation,
  relatedModel,
}: {
  /**
   * If Bar defines the reversed relation to Foo
   * bar[fieldName] should match foo._id
   * foo being the current document
   * bar the resolved document(s)
   */
  fieldName: string;
  reversedRelation: VulcanGraphqlFieldSchema["reversedRelation"];
  /** Model that defines the reversed relation */
  relatedModel;
}): QueryResolver => {
  return async (document, args, context) => {
    if (!reversedRelation) {
      throw new Error(`No reversed relation found for ${fieldName}`);
    }
    const { model, kind } = reversedRelation;
    const currentDocumentId = document._id;
    if (!currentDocumentId) {
      throw new Error(
        `Document has no _id, cannot resolve virtual relation to resolve ${relatedModel.name} from ${model.name}`
      );
    }
    let relatedDocuments: Array<VulcanDocument> = [];
    try {
      const dt = getModelDataSource(context, relatedModel);
      const rawDocuments = await dt.findByFields({
        [fieldName]: currentDocumentId,
      });
      if (rawDocuments) {
        relatedDocuments = convertToJSON(rawDocuments);
      }
    } catch (err) {
      console.warn(
        "Could not retrieve related document using a DataSource, error:",
        err
      );
      console.warn(
        "Will use the default connector instead, but it may lead to performance issue related to the 'N+1' problem."
      );
      const connector = getModelConnector(context, relatedModel);
      const input = { filter: { [fieldName]: currentDocumentId } };
      let { selector } = await connector._filter(input, context);
      relatedDocuments = await connector.find(selector);
    }

    if (kind === "hasOneReversed") {
      if (relatedDocuments.length > 1) {
        throw new Error(
          `Found more than one document with ${fieldName}=${currentDocumentId} in ${relatedModel.name} collection`
        );
      }
      if (!relatedDocuments.length) {
        return null;
      }
      const doc = relatedDocuments[0];
      return restrictViewableFields(context.currentUser, relatedModel, doc);
    } else {
      return restrictViewableFields(
        context.currentUser,
        relatedModel,
        relatedDocuments
      );
    }
  };
};
