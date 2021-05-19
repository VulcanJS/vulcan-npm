import find from "lodash/find";
import isEqualWith from "lodash/isEqualWith";
export const isNotSameDocument = (initialDocument, changedDocument) => {
  const changedValue = find(changedDocument, (value, key, collection) => {
    return !isEqualWith(value, initialDocument[key], (objValue, othValue) => {
      if (!objValue && !othValue) return true;
    });
  });
  return typeof changedValue !== "undefined";
};
