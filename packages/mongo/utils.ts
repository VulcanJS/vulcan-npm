import _object from "lodash/object";
import _map from "lodash/map";
import { VulcanDocument } from "@vulcanjs/schema";
import { VulcanModel } from "@vulcanjs/model";
import { getUserReadableFields, VulcanUser } from "@vulcanjs/permissions";
/**
 * Convert an array of field names into a Mongo fields specifier
 * @param {Array} fieldsArray
 */
export const arrayToFields = (fieldsArray) => {
  return _object(
    fieldsArray,
    _map(fieldsArray, function () {
      return true;
    })
  );
};

/**
 * Get readable fields as a mongo projection
 *
 * TODO: check were it should go
 * @param user
 * @param model
 * @param document
 */
export const getReadableProjection = function (
  user: VulcanUser,
  model: VulcanModel,
  document: VulcanDocument
) {
  return arrayToFields(getUserReadableFields(user, model, document));
};
