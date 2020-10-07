/*

Default Relation Resolvers

*/
const restrictViewableFields = () => {}; // TODO: get from a user lib

export const hasOne = async ({
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
  const relatedDocument = await context[
    relatedModel.name
  ].connector.findOneById(documentId);
  // filter related document to restrict viewable fields
  return restrictViewableFields(
    context.currentUser,
    relatedModel,
    relatedDocument
  );
};

export const hasMany = async ({ document, fieldName, context, typeName }) => {
  // if document doesn't have a "foreign key" field, return null
  if (!document[fieldName]) return null;
  // get related collection
  const relatedCollection = getCollectionByTypeName(typeName);
  // get related documents
  const relatedDocuments = await relatedCollection.loader.loadMany(
    document[fieldName]
  );
  // filter related document to restrict viewable fields
  return context.Users.restrictViewableFields(
    context.currentUser,
    relatedCollection,
    relatedDocuments
  );
};
