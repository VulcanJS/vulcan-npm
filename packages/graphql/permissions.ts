/**
 * Differences with Vulcan Meteor:
 * - guests is renamed "anyone" @see https://github.com/VulcanJS/Vulcan/issues/2541
 * - methods relying on maitaining a list of existing groups are ignored for the moment. We might reintroduce them later on.
 */
// import Users from "./collection.js";
import intersection from "lodash/intersection";
import compact from "lodash/compact";
import map from "lodash/map";
import difference from "lodash/difference";
import get from "lodash/get";
import unset from "lodash/unset";
import cloneDeep from "lodash/cloneDeep";
// import {
//   getCollection,
//   forEachDocumentField,
//   deprecate,
// } from "meteor/vulcan:lib";
import { VulcanModel } from "@vulcanjs/model";
import {
  VulcanFieldSchema,
  VulcanSchema,
  VulcanDocument,
  forEachDocumentField,
} from "@vulcanjs/schema";

// TODO: define user as a specific VulcanModel? So we get the typing already
interface User extends VulcanDocument {
  groups: Array<string>;
  isAdmin: boolean;
  _id: string;
}
type Group = "anyone" | "guests" | "members" | "owners" | "admins" | string; // "guests";

/**
 * @summary Users.groups object
 */
// Users.groups = {};

/**
 * @summary Group class
 */
/*
class Group {
  constructor() {
    this.actions = [];
  }

  can(actions) {
    actions = Array.isArray(actions) ? actions : [actions];
    this.actions = this.actions.concat(actions.map((a) => a.toLowerCase()));
  }

  cannot(actions) {
    actions = Array.isArray(actions) ? actions : [actions];
    this.actions = _.difference(
      this.actions,
      actions.map((a) => a.toLowerCase())
    );
  }
}
*/

////////////////////
// Helpers        //
////////////////////

/**
 * @summary create a new group
 * @param {String} groupName
 */
// Users.createGroup = (groupName) => {
//   Users.groups[groupName] = new Group();
// };

//
/**
 * @summary get a list of a user's groups
 * @param {Object} user
 */
export const getGroups = (
  user: User,
  document?: VulcanDocument
): Array<Group> => {
  let userGroups = [
    "anyone",
    // legacy
    "guests",
  ];

  if (user) {
    userGroups.push("members");

    if (document && owns(user, document)) {
      userGroups.push("owners");
    }

    if (user.groups) {
      // custom groups
      userGroups = userGroups.concat(user.groups);
    }

    if (isAdmin(user)) {
      // admin
      userGroups.push("admins");
    }
  }

  return userGroups;
};

/**
 * @summary get a list of all the actions a user can perform
 * @param {Object} user
 */
/*
const getActions = (user: Users) => {
  let userGroups = getGroups(user);
  if (!userGroups.includes("guests")) {
    // always give everybody permission for guests actions, too
    userGroups.push("guests");
  }
  let groupActions = userGroups.map((groupName) => {
    // note: make sure groupName corresponds to an actual group
    const group = groups[groupName];
    return group && group.actions;
  });
  return _.unique(_.flatten(groupActions));
};
*/

/**
 * @summary check if a user is a member of a group
 * @param {Array} user
 * @param {String} group or array of groups
 */
const isMemberOf = (
  user: User,
  groupOrGroups: Array<Group> | Group,
  document?: VulcanDocument
) => {
  const groups = Array.isArray(groupOrGroups) ? groupOrGroups : [groupOrGroups];
  return intersection(getGroups(user, document), groups).length > 0;
};

/**
 * @summary check if a user can perform at least one of the specified actions
 * @param {Object} user
 * @param {String/Array} action or actions
 */
/*
Users.canDo = (user, actionOrActions) => {
  const authorizedActions = Users.getActions(user);
  const actions = Array.isArray(actionOrActions)
    ? actionOrActions
    : [actionOrActions];
  return (
    isAdmin(user) || intersection(authorizedActions, actions).length > 0
  );
};
*/

/**
 * @summary Check if a user owns a document
 * @param {Object|string} userOrUserId - The user or their userId
 * @param {Object} document - The document to check (post, comment, user object, etc.)
 */
export const owns = function (user: User, document: VulcanDocument) {
  try {
    if (!!document.userId) {
      // case 1: document is a post or a comment, use userId to check
      return user._id === document.userId;
    } else {
      // case 2: document is a user, use _id or slug to check
      return document.slug
        ? user.slug === document.slug
        : user._id === document._id;
    }
  } catch (e) {
    return false; // user not logged in
  }
};

/**
 * @summary Check if a user is an admin
 * @param {Object|string} userOrUserId - The user or their userId
 */
const isAdmin = function (user: User) {
  try {
    return !!user && !!user.isAdmin;
  } catch (e) {
    return false; // user not logged in
  }
};

/**
 * @summary Check if a user can view a field
 * @param {Object} user - The user performing the action
 * @param {Object} field - The schema of the requested field
 * @param {Object} field - The full document of the collection
 * @returns {Boolean} - true if the user can read the field, false if not
 */
const canReadField = function (
  user: User,
  field: VulcanFieldSchema,
  document: Object
) {
  const canRead = field.canRead;
  if (canRead) {
    if (typeof canRead === "function") {
      // if canRead is a function, execute it with user and document passed. it must return a boolean
      return canRead(user, document);
    } else if (typeof canRead === "string") {
      // if canRead is just a string, we assume it's the name of a group and pass it to isMemberOf
      return canRead === "guests" || isMemberOf(user, canRead, document);
    } else if (Array.isArray(canRead) && canRead.length > 0) {
      // if canRead is an array, we do a recursion on every item and return true if one of the items return true
      return canRead.some((group) =>
        canReadField(user, { canRead: group }, document)
      );
    }
  }
  return false;
};

export const getReadableFields = function (
  user: User,
  model: VulcanModel,
  document?: VulcanDocument
) {
  return compact(
    map(model.schema, (field, fieldName) => {
      if (fieldName.indexOf(".$") > -1) return null;
      return canReadField(user, field, document) ? fieldName : null;
    })
  );
};

/**
 * Check if field canRead include a permission that needs to be checked against the actual document and not just from the user
 */
export const isDocumentBasedPermissionField = (field: VulcanFieldSchema) => {
  const canRead = field.canRead;
  if (canRead) {
    if (typeof canRead === "function") {
      return true;
    } else if (canRead === "owners") {
      return true;
    } else if (Array.isArray(canRead) && canRead.length > 0) {
      // recursive call on if canRead is an array
      return canRead.some((group) =>
        isDocumentBasedPermissionField({ canRead: group })
      );
    }
  }
  return false;
};

/**
 * Retrieve fields that needs the document to be already fetched to be checked, and not just the user
 * => owners permissions, custom permissions etc.
 */
export const getDocumentBasedPermissionFieldNames = function (
  model: VulcanModel
) {
  const schema = model.schema;
  const documentBasedFieldNames = Object.keys(schema).filter((fieldName) => {
    if (fieldName.indexOf(".$") > -1) return false; // ignore arrays
    const field = schema[fieldName];
    if (isDocumentBasedPermissionField(field)) return true;
    return false;
  });
  return documentBasedFieldNames;
};

/**
 * @summary Check if a user can access a list of fields
 * @param {Object} user - The user performing the action
 * @param {Object} collection - The collection
 * @param {Object} fields - The list of fields
 */
export const checkFields = (
  user: User,
  model: VulcanModel,
  fields: Array<any>
) => {
  const viewableFields = getReadableFields(user, model);
  // Initial case without document => we ignore fields that need the document to be checked
  const ambiguousFields = getDocumentBasedPermissionFieldNames(model); // these fields need to wait for the document to be present before being checked
  const fieldsToTest = difference(fields, ambiguousFields); // we only check non-ambiguous fields (canRead: ["guests", "admins"] for instance)
  const diff = difference(fieldsToTest, viewableFields);

  if (diff.length) {
    throw new Error(
      `You don't have permission to filter model ${
        model.name
      } by the following fields: ${diff.join(
        ", "
      )}. Field is not readable or do not exist.`
    );
  }
  return true;
};

/**
 * Check if user was allowed to filter this document based on some fields
 * @param {Object} user - The user performing the action
 * @param {Object} collection - The collection
 * @param {Object} fields - The list of filtered fields
 * @param {Object} document - The retrieved document
 */
export const canFilterDocument = (
  user: User,
  model: VulcanModel,
  fields: Array<any>,
  document: VulcanDocument
) => {
  const viewableFields = getReadableFields(user, model, document);
  const diff = difference(fields, viewableFields);
  return !diff.length; // if length is > 0, it means that this document wasn't filterable by user in the first place, based on provided filter, we must remove it
};

/**
 * Remove restricted fields from a  document
 * @param document
 * @param schema
 * @param currentUser
 */
export const restrictDocument = (
  document: VulcanDocument,
  schema: VulcanSchema,
  currentUser: User
): VulcanDocument => {
  let restrictedDocument = cloneDeep(document);
  forEachDocumentField(
    document,
    schema,
    ({ fieldName, fieldSchema, currentPath, isNested }) => {
      if (isNested && (!fieldSchema || !fieldSchema.canRead)) return; // ignore nested fields without permissions
      if (!fieldSchema || !canReadField(currentUser, fieldSchema, document)) {
        unset(restrictedDocument, `${currentPath}${fieldName}`);
      }
    }
  );
  return restrictedDocument;
};
/**
 * @summary For a given document or list of documents, keep only fields viewable by current user
 * @param {Object} user - The user performing the action
 * @param {Object} collection - The collection
 * @param {Object} document - The document being returned by the resolver
 */
export const restrictViewableFields = (
  user,
  model: VulcanModel,
  docOrDocs: Array<VulcanDocument> | VulcanDocument
) => {
  if (!docOrDocs) return {};
  const schema = model.schema;
  const restrictDoc = (document) => restrictDocument(document, schema, user);

  return Array.isArray(docOrDocs)
    ? docOrDocs.map(restrictDoc)
    : restrictDoc(docOrDocs);
};

/**
 * @summary For a given of documents, keep only documents and fields viewable by current user (new APIs)
 * @param {Object} user - The user performing the action
 * @param {Object} collection - The collection
 * @param {Object} document - The document being returned by the resolver
 */
export const restrictDocuments = function ({
  user,
  model,
  documents,
}: {
  user: User;
  model: VulcanModel;
  documents: Array<VulcanDocument>;
}) {
  const check = get(model, "permissions.canRead");
  let readableDocuments = documents;
  if (check) {
    readableDocuments = documents.filter((document) =>
      canReadDocument({ model, document, user })
    );
  }
  const restrictedDocuments = restrictViewableFields(
    user,
    model,
    readableDocuments
  );
  return restrictedDocuments;
};

/**
 * @summary Check if a user can submit a field
 * @param {Object} user - The user performing the action
 * @param {Object} field - The field being edited or inserted
 */
export const canCreateField = function (user: User, field: VulcanFieldSchema) {
  const canCreate = field.canCreate;
  if (canCreate) {
    if (typeof canCreate === "function") {
      // if canCreate is a function, execute it with user and document passed. it must return a boolean
      return canCreate(user);
    } else if (typeof canCreate === "string") {
      // if canCreate is just a string, we assume it's the name of a group and pass it to isMemberOf
      // note: if canCreate is 'guests' then anybody can create it
      return (
        canCreate === "guests" ||
        canCreate === "anyone" ||
        isMemberOf(user, canCreate)
      );
    } else if (Array.isArray(canCreate) && canCreate.length > 0) {
      // if canCreate is an array, we do a recursion on every item and return true if one of the items return true
      return canCreate.some((group) =>
        canCreateField(user, { canCreate: group })
      );
    }
  }
  return false;
};

/** @function
 * Check if a user can edit a field
 * @param {Object} user - The user performing the action
 * @param {Object} field - The field being edited or inserted
 * @param {Object} document - The document being edited or inserted
 */
export const canUpdateField = function (
  user: User,
  field: VulcanFieldSchema,
  document: VulcanDocument
) {
  const canUpdate = field.canUpdate || field.editableBy; //OpenCRUD backwards compatibility

  if (canUpdate) {
    if (typeof canUpdate === "function") {
      // if canUpdate is a function, execute it with user and document passed. it must return a boolean
      return canUpdate(user, document);
    } else if (typeof canUpdate === "string") {
      // if canUpdate is just a string, we assume it's the name of a group and pass it to isMemberOf
      // note: if canUpdate is 'guests' then anybody can create it
      return (
        canUpdate === "guests" ||
        canUpdate === "anyone" ||
        isMemberOf(user, canUpdate, document)
      );
    } else if (Array.isArray(canUpdate) && canUpdate.length > 0) {
      // if canUpdate is an array, we look at every item and return true if one of the items return true
      return canUpdate.some((group) =>
        canUpdateField(user, { canUpdate: group }, document)
      );
    }
  }
  return false;
};

/** @function
 * Check if a user passes a permission check (new API)
 * @param {Object} check - The permission check being tested
 * @param {Object} user - The user performing the action
 * @param {Object} document - The document being edited or inserted
 */
export const permissionCheck = (options: {
  check: Function | Array<Group>;
  user: User;
  document?: VulcanDocument;
}) => {
  const { check, user, document } = options;
  if (isAdmin(user)) {
    // admins always pass all permission checks
    return true;
  } else if (typeof check === "function") {
    return check(options);
  } else if (Array.isArray(check)) {
    return isMemberOf(user, check, document);
  }
};

// TODO: adapt to modelsoptions

interface CanActionOnDocumentOptions {
  model: VulcanModel;
  document: VulcanDocument;
  user: User;
}
export const canReadDocument = (options: CanActionOnDocumentOptions) => {
  const { model } = options;
  const check = get(model, "permissions.canRead");
  if (!check) {
    // eslint-disable-next-line no-console
    console.warn(
      `Users.canReadDocument() was called but no [canRead] permission was defined for model [${model.name}]`
    );
  }
  return (
    check && permissionCheck({ ...options, check /*, operationName: "read"*/ })
  );
};
export const canCreateDocument = (options: CanActionOnDocumentOptions) => {
  const { model } = options;
  const check = get(model, "permissions.canCreate");
  if (!check) {
    // eslint-disable-next-line no-console
    console.warn(
      `Users.canCreate() was called but no [canCreate] permission was defined for model [${model.name}]`
    );
  }
  return (
    check &&
    permissionCheck({ ...options, check /*, operationName: "create"*/ })
  );
};

export const canUpdateDocument = (options: CanActionOnDocumentOptions) => {
  const { model } = options;
  const check = get(model, "permissions.canUpdate");
  if (!check) {
    // eslint-disable-next-line no-console
    console.warn(
      `Users.canUpdate() was called but no [canUpdate] permission was defined for model [${model.name}]`
    );
  }
  return (
    check &&
    permissionCheck({ ...options, check /*, operationName: "update"*/ })
  );
};
export const canDeleteDocument = (options: CanActionOnDocumentOptions) => {
  const { model } = options;
  const check = get(model, "permissions.canDelete");
  if (!check) {
    // eslint-disable-next-line no-console
    console.warn(
      `Users.canDelete() was called but no [canDelete] permission was defined for model [${model.name}]`
    );
  }
  return (
    check &&
    permissionCheck({ ...options, check /*, operationName: "delete"*/ })
  );
};

////////////////////
// Initialize     //
////////////////////

/**
 * @summary initialize the 3 out-of-the-box groups
 */
/*
Users.createGroup("guests"); // non-logged-in users
Users.createGroup("members"); // regular users

const membersActions = [
  "user.create",
  "user.update.own",
  // OpenCRUD backwards compatibility
  "users.new",
  "users.edit.own",
  "users.remove.own",
];
Users.groups.members.can(membersActions);

Users.createGroup("admins"); // admin users

const adminActions = [
  "user.create",
  "user.update.all",
  "user.delete.all",
  "setting.update",
  // OpenCRUD backwards compatibility
  "users.new",
  "users.edit.all",
  "users.remove.all",
  "settings.edit",
];
Users.groups.admins.can(adminActions);
*/
