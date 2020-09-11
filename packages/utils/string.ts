/*

Utilities

*/

// import marked from "marked";
// import { getSetting, registerSetting } from "./settings.js";
// import { Routes } from "./routes.js";
// import set from "lodash/set";
import get from "lodash/get";
import isFunction from "lodash/isFunction";
// import pluralize from "pluralize";
// import { getFieldType } from "./simpleSchema_utils";
import isEmpty from "lodash/isEmpty";

/**
 * @summary Convert a camelCase string to dash-separated string
 * @param {String} str
 */
export const camelToDash = function (str) {
  return str
    .replace(/\W+/g, "-")
    .replace(/([a-z\d])([A-Z])/g, "$1-$2")
    .toLowerCase();
};

/**
 * @summary Convert a camelCase string to a space-separated capitalized string
 * See http://stackoverflow.com/questions/4149276/javascript-camelcase-to-regular-form
 * @param {String} str
 */
export const camelToSpaces = function (str) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, function (str) {
    return str.toUpperCase();
  });
};

/**
 * @summary Convert a string to title case ('foo bar baz' to 'Foo Bar Baz')
 * See https://stackoverflow.com/questions/4878756/how-to-capitalize-first-letter-of-each-word-like-a-2-word-city
 * @param {String} str
 */
export const toTitleCase = (str) =>
  str &&
  str
    .toLowerCase()
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(" ");

/**
 * @summary Convert an underscore-separated string to dash-separated string
 * @param {String} str
 */
export const underscoreToDash = function (str) {
  return str.replace("_", "-");
};

/**
 * @summary Convert a dash separated string to camelCase.
 * @param {String} str
 */
export const dashToCamel = function (str) {
  return str.replace(/(\-[a-z])/g, function ($1) {
    return $1.toUpperCase().replace("-", "");
  });
};

/**
 * @summary Convert a string to camelCase and remove spaces.
 * @param {String} str
 */
export const camelCaseify = function (str) {
  str = dashToCamel(str.replace(" ", "-"));
  str = str.slice(0, 1).toLowerCase() + str.slice(1);
  return str;
};

/**
 * @summary Trim a sentence to a specified amount of words and append an ellipsis.
 * @param {String} s - Sentence to trim.
 * @param {Number} numWords - Number of words to trim sentence to.
 */
export const trimWords = function (s, numWords) {
  if (!s) return s;

  var expString = s.split(/\s+/, numWords);
  if (expString.length >= numWords) return expString.join(" ") + "…";
  return s;
};

/**
 * @summary Trim a block of HTML code to get a clean text excerpt
 * @param {String} html - HTML to trim.
 */
export const trimHTML = function (html, numWords) {
  var text = stripHTML(html);
  return trimWords(text, numWords);
};

/**
 * @summary Capitalize a string.
 * @param {String} str
 */
export const capitalize = function (str) {
  return str && str.charAt(0).toUpperCase() + str.slice(1);
};

// Utils.t = function (message) {
//   var d = new Date();
//   console.log(
// '### ' + message + ' rendered at ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds()
//   ); // eslint-disable-line
// };

export const nl2br = function (str) {
  var breakTag = "<br />";
  return (str + "").replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    "$1" + breakTag + "$2"
  );
};

/////////////////////////////
// String Helper Functions //
/////////////////////////////

export const cleanUp = function (s) {
  return stripHTML(s);
};

export const sanitize = function (s) {
  return s;
};

export const stripHTML = function (s) {
  return s && s.replace(/<(?:.|\n)*?>/gm, "");
};

/*
export const stripMarkdown = function (s) {
  var htmlBody = marked(s);
  return stripHTML(htmlBody);
};
*/

// http://stackoverflow.com/questions/2631001/javascript-test-for-existence-of-nested-object-key
export const checkNested = function (obj /*, level1, level2, ... levelN*/) {
  var args = Array.prototype.slice.call(arguments);
  obj = args.shift();

  for (var i = 0; i < args.length; i++) {
    if (!obj.hasOwnProperty(args[i])) {
      return false;
    }
    obj = obj[args[i]];
  }
  return true;
};

// see http://stackoverflow.com/questions/8051975/access-object-child-properties-using-a-dot-notation-string
export const getNestedProperty = function (obj, desc) {
  var arr = desc.split(".");
  while (arr.length && (obj = obj[arr.shift()]));
  return obj;
};

export const getFieldLabel = (fieldName, collection) => {
  const label = collection.simpleSchema()._schema[fieldName].label;
  const nameWithSpaces = camelToSpaces(fieldName);
  return label || nameWithSpaces;
};

export const findIndex = (array, predicate) => {
  let index = -1;
  let continueLoop = true;
  array.forEach((item, currentIndex) => {
    if (continueLoop && predicate(item)) {
      index = currentIndex;
      continueLoop = false;
    }
  });
  return index;
};

// adapted from http://stackoverflow.com/a/22072374/649299
/*
export const unflatten = function (array, options, parent, level = 0, tree) {
  const {
    idProperty = "_id",
    parentIdProperty = "parentId",
    childrenProperty = "childrenResults",
  } = options;

  level++;

  tree = typeof tree !== "undefined" ? tree : [];

  let children = [];

  if (typeof parent === "undefined") {
    // if there is no parent, we're at the root level
    // so we return all root nodes (i.e. nodes with no parent)
    children = _.filter(array, (node) => !get(node, parentIdProperty));
  } else {
    // if there *is* a parent, we return all its child nodes
    // (i.e. nodes whose parentId is equal to the parent's id.)
    children = _.filter(
      array,
      (node) => get(node, parentIdProperty) === get(parent, idProperty)
    );
  }

  // if we found children, we keep on iterating
  if (!!children.length) {
    if (typeof parent === "undefined") {
      // if we're at the root, then the tree consist of all root nodes
      tree = children;
    } else {
      // else, we add the children to the parent as the "childrenResults" property
      set(parent, childrenProperty, children);
    }

    // we call the function on each child
    children.forEach((child) => {
      child.level = level;
      unflatten(array, options, child, level);
    });
  }

  return tree;
};
*/

// remove the telescope object from a schema and duplicate it at the root
export const stripTelescopeNamespace = (schema) => {
  // grab the users schema keys
  const schemaKeys = Object.keys(schema);

  // remove any field beginning by telescope: .telescope, .telescope.upvotedPosts.$, ...
  const filteredSchemaKeys = schemaKeys.filter(
    (key) => key.slice(0, 9) !== "telescope"
  );

  // replace the previous schema by an object based on this filteredSchemaKeys
  return filteredSchemaKeys.reduce(
    (sch, key) => ({ ...sch, [key]: schema[key] }),
    {}
  );
};

/**
 * Get the display name of a React component
 * @param {React Component} WrappedComponent
 */
export const getComponentDisplayName = (WrappedComponent) => {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
};

export const encodeIntlError = (error) =>
  typeof error !== "object" ? error : JSON.stringify(error);

export const decodeIntlError = (error, options = { stripped: false }) => {
  try {
    // do we get the error as a string or as an error object?
    let strippedError = typeof error === "string" ? error : error.message;

    // if the error hasn't been cleaned before (ex: it's not an error from a form)
    if (!options.stripped) {
      // strip the "GraphQL Error: message [error_code]" given by Apollo if present
      const graphqlPrefixIsPresent = strippedError.match(/GraphQL error: (.*)/);
      if (graphqlPrefixIsPresent) {
        strippedError = graphqlPrefixIsPresent[1];
      }

      // strip the error code if present
      const errorCodeIsPresent = strippedError.match(/(.*)\[(.*)\]/);
      if (errorCodeIsPresent) {
        strippedError = errorCodeIsPresent[1];
      }
    }

    // the error is an object internationalizable
    const parsedError = JSON.parse(strippedError);

    // check if the error has at least an 'id' expected by react-intl
    if (!parsedError.id) {
      console.error("[Undecodable error]", error); // eslint-disable-line
      return { id: "app.something_bad_happened", value: "[undecodable error]" };
    }

    // return the parsed error
    return parsedError;
  } catch (__) {
    // the error is not internationalizable
    return error;
  }
};

export const findWhere = (array, criteria) =>
  array.find((item) =>
    Object.keys(criteria).every((key) => item[key] === criteria[key])
  );

export const defineName = (o, name) => {
  Object.defineProperty(o, "name", { value: name });
  return o;
};

export const isPromise = (value) => isFunction(get(value, "then"));

/**
 * Pluralize helper with clash name prevention (adds an S)
 *
 * @deprecated Automated pluralization is room for troubles => to be avoided at any cost
 * except for pure display usage
 */
/*
export const pluralize = (text, ...args) => {
  const res = pluralize(text, ...args);
  // avoid edge case like "people" where plural is identical to singular, leading to name clash
  // in resolvers
  if (res === text) {
    return res + "s";
  }
  return res;
};
*/

/*
export const singularize = pluralize.singular;
*/
export const removeProperty = (obj, propertyName) => {
  for (const prop in obj) {
    if (prop === propertyName) {
      delete obj[prop];
    } else if (typeof obj[prop] === "object") {
      removeProperty(obj[prop], propertyName);
    }
  }
};

/**
 * Convert an array of field options into an allowedValues array
 * @param {Array} schemaFieldOptionsArray
 */
export const getSchemaFieldAllowedValues = (schemaFieldOptionsArray) => {
  if (!Array.isArray(schemaFieldOptionsArray)) {
    throw new Error("getAllowedValues: Expected Array");
  }
  return schemaFieldOptionsArray.map(
    (schemaFieldOption) => schemaFieldOption.value
  );
};

/**
 * type is an array due to the possibility of using SimpleSchema.oneOf
 * right now we support only fields with one type
 * @param {Object} field
 */
export const getFieldType = (field) => get(field, "type.definitions.0.type");

/**
 * Convert an array of field names into a Mongo fields specifier
 * @param {Array} fieldsArray
 */
/*
export const arrayToFields = (fieldsArray) => {
  return _.object(
    fieldsArray,
    _.map(fieldsArray, function () {
      return true;
    })
  );
};
*/

export const isEmptyOrUndefined = (value) =>
  typeof value === "undefined" ||
  value === null ||
  value === "" ||
  (typeof value === "object" && isEmpty(value) && !(value instanceof Date));
