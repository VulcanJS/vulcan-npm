// import { forEachDocumentField } from "./schema_utils";
import moment from "moment";
export const getDateRange = function (pageNumber) {
  var now = moment(new Date());
  var dayToDisplay = now.subtract(pageNumber - 1, "days");
  var range: any = {};
  range.start = dayToDisplay.startOf("day").valueOf();
  range.end = dayToDisplay.endOf("day").valueOf();
  // console.log("after: ", dayToDisplay.startOf('day').format("dddd, MMMM Do YYYY, h:mm:ss a"));
  // console.log("before: ", dayToDisplay.endOf('day').format("dddd, MMMM Do YYYY, h:mm:ss a"));
  return range;
};

/**
 * Take a collection and a list of documents, and convert all their date fields to date objects
 * This is necessary because Apollo doesn't support custom scalars, and stores dates as strings
 * @param {Object} collection
 * @param {Array} list
 */
/*
export const convertDates = (collection, listOrDocument) => {
  // if undefined, just return
  if (!listOrDocument) return listOrDocument;
  const isArray = listOrDocument && Array.isArray(listOrDocument);
  if (isArray && !listOrDocument.length) return listOrDocument;
  const list = isArray ? listOrDocument : [listOrDocument];
  const schema = collection.simpleSchema()._schema;
  //Nested version
  const convertedList = list.map((document) => {
    forEachDocumentField(
      document,
      schema,
      ({ fieldName, fieldSchema, currentPath }) => {
        if (fieldSchema && getFieldType(fieldSchema) === Date) {
          const valuePath = `${currentPath}${fieldName}`;
          const value = get(document, valuePath);
          set(document, valuePath, new Date(value));
        }
      }
    );
    return document;
  });
  return isArray ? convertedList : convertedList[0];
};
*/
