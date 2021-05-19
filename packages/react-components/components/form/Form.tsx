/*

Main form component.

This component expects:

### All Forms:

- collection
- currentUser
- client (Apollo client)

*/

import React, { Component } from "react";
import PropTypes from "prop-types";
import { runCallbacks, getErrors } from "@vulcanjs/core";
import {
  isIntlField,
  formatLabel,
  getIntlKeys,
  getIntlLabel,
  IntlProviderContext,
} from "@vulcanjs/i18n";
import { capitalize, removeProperty } from "@vulcanjs/utils";
import { FieldGroup } from "@vulcanjs/schema";
import _filter from "lodash/filter";
import cloneDeep from "lodash/cloneDeep";
import compact from "lodash/compact";
import find from "lodash/find";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import isEqualWith from "lodash/isEqualWith";
import isObject from "lodash/isObject";
import map from "lodash/map";
import mapValues from "lodash/mapValues";
import merge from "lodash/merge";
import omit from "lodash/omit";
import omitBy from "lodash/omitBy";
import pick from "lodash/pick";
import pickBy from "lodash/pickBy";
import set from "lodash/set";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import unset from "lodash/unset";
import update from "lodash/update";
import without from "lodash/without";

import { FormField } from "./typings";

import {
  convertSchema,
  formProperties,
  getEditableFields,
  getInsertableFields,
} from "./modules/schema_utils";
import { isEmptyValue } from "./modules/utils";
import { getParentPath } from "./modules/path_utils";
// import withCollectionProps from "./withCollectionProps";
import { callbackProps } from "./propTypes";
import _ from "underscore";
import { VulcanModel } from "@vulcanjs/model";
import { VulcanSchema } from "@vulcanjs/schema";
import { User } from "@vulcanjs/permissions";
import {
  defaultVulcanComponents,
  PossibleFormComponents,
} from "./defaultVulcanComponents";
import { FormContext } from "./FormContext";

// props that should trigger a form reset
const RESET_PROPS = [
  "model",
  // "collection",
  // "collectionName",
  "document",
  "schema",
  "currentUser",
  "fields",
  "removeFields",
  "prefilledProps", // TODO: prefilledProps should be merged instead?
];

const compactParent = (object, path) => {
  const parentPath = getParentPath(path);

  // note: we only want to compact arrays, not objects
  const compactIfArray = (x) => (Array.isArray(x) ? compact(x) : x);

  update(object, parentPath, compactIfArray);
};

const getDefaultValues = (convertedSchema) => {
  // TODO: make this work with nested schemas, too
  return pickBy(
    mapValues(convertedSchema, (field) => field.defaultValue),
    (value) => value
  );
};

const compactObject = (o) => omitBy(o, (f) => f === null || f === undefined);

const getInitialStateFromProps = (nextProps: FormProps) => {
  const schema = nextProps.schema || nextProps.model.schema;
  const convertedSchema = convertSchema(schema);
  const formType = nextProps.document ? "edit" : "new";
  // for new document forms, add default values to initial document
  const defaultValues =
    formType === "new" ? getDefaultValues(convertedSchema) : {};
  // note: we remove null/undefined values from the loaded document so they don't overwrite possible prefilledProps
  const initialDocument = merge(
    {},
    defaultValues,
    nextProps.prefilledProps,
    compactObject(nextProps.document)
  );

  //if minCount is specified, go ahead and create empty nested documents
  Object.keys(convertedSchema).forEach((key) => {
    let minCount = convertedSchema[key].minCount;
    if (minCount) {
      initialDocument[key] = initialDocument[key] || [];
      while (initialDocument[key].length < minCount)
        initialDocument[key].push({});
    }
  });

  // remove all instances of the `__typename` property from document
  removeProperty(initialDocument, "__typename");

  return {
    disabled: nextProps.disabled,
    errors: [],
    deletedValues: [],
    currentValues: {},
    originalSchema: convertSchema(schema, { removeArrays: false }),
    // convert SimpleSchema schema into JSON object
    schema: convertedSchema,
    // Also store all field schemas (including nested schemas) in a flat structure
    flatSchema: convertSchema(schema, { flatten: true }),
    // the initial document passed as props
    initialDocument,
    // initialize the current document to be the same as the initial document
    currentDocument: initialDocument,
  };
};

/*

  Get a list of the fields to be included in the current form

  Note: when submitting the form (getData()), do not include any extra fields.

  */
const getFieldNames = (
  props: FormProps,
  currentDocument,
  optionsFromArgs: {
    excludeHiddenFields?: boolean;
    excludeRemovedFields?: boolean;
    replaceIntlFields?: boolean;
    addExtraFields?: boolean;
    schema?: VulcanSchema;
    mutableFields?: Array<any>;
  } = {}
) => {
  const { fields, addFields, removeFields, hideFields } = props;
  const defaultOptions = {
    excludeHiddenFields: true,
    excludeRemovedFields: true,
    replaceIntlFields: false,
    addExtraFields: false,
  };
  const options = {
    ...defaultOptions,
    ...optionsFromArgs,
  };
  const {
    schema,
    mutableFields,
    excludeRemovedFields,
    excludeHiddenFields,
    addExtraFields,
    replaceIntlFields,
  } = options;

  // get all editable/insertable fields (depending on current form type)
  let relevantFields = mutableFields;

  // if "fields" prop is specified, restrict list of fields to it
  if (typeof fields !== "undefined" && fields.length > 0) {
    relevantFields = _.intersection(relevantFields, fields);
  }

  // if "hideFields" prop is specified, remove its fields
  if (excludeRemovedFields) {
    // OpenCRUD backwards compatibility
    //const removeFields = removeFields || hideFields;
    if (typeof removeFields !== "undefined" && removeFields.length > 0) {
      relevantFields = _.difference(relevantFields, removeFields);
    }
  }

  // if "addFields" prop is specified, add its fields
  if (
    addExtraFields &&
    typeof addFields !== "undefined" &&
    addFields.length > 0
  ) {
    relevantFields = relevantFields.concat(addFields);
  }

  // remove all hidden fields
  if (excludeHiddenFields) {
    const document = currentDocument;
    relevantFields = _.reject(relevantFields, (fieldName) => {
      const hidden = schema[fieldName].hidden;
      return typeof hidden === "function"
        ? hidden({ props, document })
        : hidden;
    });
  }

  // replace intl fields
  if (replaceIntlFields) {
    relevantFields = relevantFields.map((fieldName) =>
      isIntlField(schema[fieldName]) ? `${fieldName}_intl` : fieldName
    );
  }

  // remove any duplicates
  relevantFields = uniq(relevantFields);

  return relevantFields;
};

/*

1. Constructor
2. Helpers
3. Errors
4. Context
4. Method & Callback
5. Render

*/

export interface FormState {
  schema: any;
  initialDocument: any;
  currentDocument: any;
  deletedValues: any;
  errors: any;
  currentValues: any;
  disabled: any;
  success?: any;
  flatSchema: any;
  originalSchema: any;
}
type PropsFromPropTypes = {
  // [key in keyof Form["propTypes"]]?: any;
}; // dumb type just to remove errors, to be improved by replacing propTypes with ts
export interface FormProps<TModel = { [key in string]: any }>
  extends PropsFromPropTypes {
  // TODO: router stuffs
  refetch?: Function;
  history?: any;
  id?: string;
  // TODO: merge
  components?: {};
  /* The model in which to edit or insert a document. */
  model: VulcanModel;
  /** Passing directly a raw schema (TODO: model is still mandatory atm) */
  schema?: VulcanSchema;
  document?: any;
  disabled?: boolean;
  currentUser?: User;
  addFields?: any;
  removeFields?: any;
  hideFields?: any;
  warnUnsavedChanges?: boolean;
  contextName?: string;
  formComponents?: PossibleFormComponents;
  itemProperties?: Object;
  showDelete?: boolean;
  // labels
  cancelLabel?: string;
  revertLabel?: string;
  //
  revertCallback?: Function;
  successComponent?: any;
  /* Instead of passing collection you can pass the name of the collection.*/
  // collectionName?: string;
  /*If present, the document to edit. If not present, the form will be a “new document” form.*/
  documentId?: string;
  /*An array of field names, if you want to restrict the form to a specific set of fields.*/
  fields?: Array<keyof TModel>;
  /*The text inside the submit button of the form.*/
  submitLabel?: string;
  /*A layout property used to control how the form fields are displayed. Defaults to horizontal.*/
  layout?: "horizontal" | "vertical";
  /*Whether to show a “delete document” link on edit forms.*/
  showRemove?: boolean;
  /*A set of props used to prefill the form. */
  prefilledProps?: TModel & Object; // TODO: should it allow only fields from the Model or also additional fields?
  /*Whether to repeat validation errors at the bottom of the form.*/
  repeatErrors?: boolean;
  //Callbacks
  /*A callback called on form submission on the form data. Can return the submitted data object as well.*/
  submitCallback?: (data) => any;
  /*A callback called on mutation success.*/
  successCallback?: (document, meta: { form: any }) => void;
  /*A callback called on mutation failure.*/
  errorCallback?: (document, error, meta: { form: any }) => void;
  /*If a cancelCallback function is provided, a “cancel” link will be shown next to the form’s submit button and the callback will be called on click.*/
  cancelCallback?: (document) => void;
  /*A callback to call when a document is successfully removed (deleted).*/
  removeSuccessCallback?: (document) => void;

  /*A callback called a every change or blur event inside the form.*/
  changeCallback: (currentDocument) => void;
  // Fragments
  /*A GraphQL fragment used to specify the data to fetch to populate edit forms.
If no fragment is passed, SmartForm will do its best to figure out what data to load based on the fields included in the form.
*/
  queryFragment?: string;
  /*A GraphQL fragment used to specify the data to return once a mutation is complete.

If no fragment is passed, SmartForm will only return fields used in the form, but note that this might sometimes lead to discrepancies when compared with documents already loaded on the client.

An example would be a createdAt date added automatically on creation even though it’s not part of the actual form. If you’d like that field to be returned after the mutation, you can define a custom mutationFragment that includes it explicitly.*/
  mutationFragment?: string;

  // mutations from container
  // => replace the "onSubmit" of a normal form
  createDocument: Function;
  updateDocument: Function;
  deleteDocument: Function;
  // ??
  createDocumentMeta?: { error?: any };
  updateDocumentMeta?: { error?: any };
}

// Group of multiple fields (obtained by parsing the whole schema)
interface GroupWithFields extends FieldGroup {
  fields: Array<FormField>;
}

export class Form extends Component<FormProps, FormState> {
  constructor(props) {
    super(props);
    const state = getInitialStateFromProps(props);
    this.state = {
      ...state,
    };
    if (props.initCallback) props.initCallback(state.currentDocument);
  }

  unblock: Function;
  form: any;

  static propTypes = {
    // main options

    document: PropTypes.object, // if a document is passed, this will be an edit form
    schema: PropTypes.object, // usually not needed

    // graphQL
    // => now mutations have dynamic names
    //newMutation: PropTypes.func, // the new mutation
    //editMutation: PropTypes.func, // the edit mutation
    //removeMutation: PropTypes.func, // the remove mutation

    // form
    prefilledProps: PropTypes.object,
    layout: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.string),
    addFields: PropTypes.arrayOf(PropTypes.string),
    removeFields: PropTypes.arrayOf(PropTypes.string),
    hideFields: PropTypes.arrayOf(PropTypes.string), // OpenCRUD backwards compatibility
    showRemove: PropTypes.bool,
    showDelete: PropTypes.bool,
    submitLabel: PropTypes.node,
    cancelLabel: PropTypes.node,
    revertLabel: PropTypes.node,
    repeatErrors: PropTypes.bool,
    warnUnsavedChanges: PropTypes.bool,
    formComponents: PropTypes.object,
    disabled: PropTypes.bool,
    itemProperties: PropTypes.object,
    successComponent: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.element,
    ]),
    contextName: PropTypes.string,

    // callbacks
    ...callbackProps,

    currentUser: PropTypes.object,
    client: PropTypes.object,
  };

  static defaultProps = {
    layout: "horizontal",
    prefilledProps: {},
    repeatErrors: false,
    showRemove: true,
    showDelete: true,
  };

  static contextType = IntlProviderContext;

  defaultValues = {};

  submitFormCallbacks: Array<Function> = [];
  successFormCallbacks: Array<Function> = [];
  failureFormCallbacks: Array<Function> = [];

  // --------------------------------------------------------------------- //
  // ------------------------------- Helpers ----------------------------- //
  // --------------------------------------------------------------------- //

  /*

  Get the current document

  */
  getDocument = () => {
    return this.state.currentDocument;
  };

  /*

  Like getDocument, but cross-reference with getFieldNames()
  to only return fields that actually need to be submitted

  Also remove any deleted values.

  */
  getData = (customArgs) => {
    // we want to keep prefilled data even for hidden/removed fields
    let data = this.props.prefilledProps || {};

    // omit prefilled props for nested fields
    data = omitBy(data, (value, key) => key.endsWith(".$"));

    const args = {
      excludeRemovedFields: false,
      excludeHiddenFields: false,
      replaceIntlFields: true,
      addExtraFields: false,
      ...customArgs,
    };

    // only keep relevant fields
    // for intl fields, make sure we look in foo_intl and not foo
    const fields = getFieldNames(this.props, this.getDocument(), args);
    data = { ...data, ...pick(this.getDocument(), ...fields) };

    // compact deleted values
    this.state.deletedValues.forEach((path) => {
      if (path.includes(".")) {
        /*

        If deleted field is a nested field, nested array, or nested array item, try to compact its parent array

        - Nested field: 'address.city'
        - Nested array: 'addresses.1'
        - Nested array item: 'addresses.1.city'

        */
        compactParent(data, path);
      }
    });

    // run data object through submitForm callbacks
    data = runCallbacks({
      callbacks: this.submitFormCallbacks,
      iterator: data,
      args: [{ form: this }],
    });

    return data;
  };

  /*

  Get form components, in case any has been overwritten for this specific form

  */
  // TODO: use components from context instead when moving to stateless
  getMergedComponents = () =>
    merge({}, defaultVulcanComponents, this.props.components);

  // --------------------------------------------------------------------- //
  // -------------------------------- Fields ----------------------------- //
  // --------------------------------------------------------------------- //

  /*

  Get all field groups

  */
  getFieldGroups = () => {
    // build fields array by iterating over the list of field names
    let fields = getFieldNames(this.props, this.getDocument()).map(
      (fieldName) => {
        // get schema for the current field
        return this.createField(fieldName, this.state.schema);
      }
    );

    fields = sortBy(fields, "order");

    // get list of all unique groups (based on their name) used in current fields, remove "empty" group
    let groups = compact(
      uniqBy(map(fields, "group"), (g) => (g ? g.name : ""))
    );

    // for each group, add relevant fields
    let groupsWithFields = groups.map((group) => {
      const label =
        group.label ||
        this.context.formatMessage({ id: group.name }) ||
        capitalize(group.name);
      const groupFields = _.filter(fields, (field) => {
        return field.group && field.group.name === group.name;
      });
      const groupWithFields: GroupWithFields = {
        ...group,
        label,
        fields: groupFields,
      };
      return groupWithFields;
    });

    // add default group if necessary
    const defaultGroupFields = _filter(fields, (field) => !field.group);
    if (defaultGroupFields.length) {
      const defaultGroup: GroupWithFields = {
        name: "default",
        label: "default",
        order: 0,
        fields: defaultGroupFields,
      };
      groupsWithFields = [defaultGroup].concat(groupsWithFields);
    }

    // sort by order
    groupsWithFields = sortBy(groupsWithFields, "order");

    // console.log(groups);

    return groupsWithFields;
  };

  initField = (fieldName, fieldSchema) => {
    const isArray = get(fieldSchema, "type.0.type") === Array;

    // intialize properties
    let field: Partial<FormField> = {
      ...pick(fieldSchema, formProperties),
      name: fieldName,
      datatype: fieldSchema.type,
      layout: this.props.layout, // A layout property used to control how the form fields are displayed. Defaults to horizontal.
      input: fieldSchema.input || fieldSchema.control, // TODO
    };

    // if this is an array field also store its array item type
    if (isArray) {
      const itemFieldSchema = this.state.originalSchema[`${fieldName}.$`];
      field.itemDatatype = get(itemFieldSchema, "type.0.type");
    }

    field.label = this.getLabel(fieldName);
    field.intlKeys = this.getIntlKeys(fieldName);
    // // replace value by prefilled value if value is empty
    // const prefill = fieldSchema.prefill || (fieldSchema.form && fieldSchema.form.prefill);
    // if (prefill) {
    //   const prefilledValue = typeof prefill === 'function' ? prefill.call(fieldSchema) : prefill;
    //   if (!!prefilledValue && !field.value) {
    //     field.prefilledValue = prefilledValue;
    //     field.value = prefilledValue;
    //   }
    // }

    const document = this.getDocument();
    field.document = document;

    // internationalize field options labels
    if (field.options && Array.isArray(field.options)) {
      field.options = field.options.map((option) => ({
        ...option,
        label: this.getOptionLabel(fieldName, option),
      }));
    }

    // if this an intl'd field, use a special intlInput
    if (isIntlField(fieldSchema)) {
      field.intlInput = true;
    }

    // add any properties specified in fieldSchema.form as extra props passed on
    // to the form component, calling them if they are functions
    const inputProperties =
      fieldSchema.form || fieldSchema.inputProperties || {};
    for (const prop in inputProperties) {
      const property = inputProperties[prop];
      field[prop] =
        typeof property === "function"
          ? property.call(fieldSchema, {
              ...this.props,
              fieldName,
              document,
              intl: this.context,
            })
          : property;
    }

    // add description as help prop
    const description = this.getDescription(fieldName);
    if (description) {
      field.help = description;
    }

    return field as FormField;
  };
  handleFieldPath = (
    field: FormField,
    fieldName: string,
    parentPath?: string
  ) => {
    const fieldPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
    field.path = fieldPath;
    if (field.defaultValue) {
      set(this.defaultValues, fieldPath, field.defaultValue);
    }
    return field;
  };
  handleFieldParent = (field, parentFieldName) => {
    // if field has a parent field, pass it on
    if (parentFieldName) {
      field.parentFieldName = parentFieldName;
    }

    return field;
  };
  handlePermissions = (field, fieldName, schema) => {
    // if field is not creatable/updatable, disable it
    if (!this.getMutableFields(schema).includes(fieldName)) {
      field.disabled = true;
    }
    return field;
  };
  handleFieldChildren = (field, fieldName, fieldSchema, schema) => {
    // array field
    if (fieldSchema.arrayFieldSchema) {
      field.arrayFieldSchema = fieldSchema.arrayFieldSchema;
      // create a field that can be exploited by the form
      field.arrayField = this.createArraySubField(
        fieldName,
        field.arrayFieldSchema,
        schema
      );
      //field.nestedInput = true
    }
    // nested fields: set input to "nested"
    if (fieldSchema.schema) {
      field.nestedSchema = fieldSchema.schema;
      field.nestedInput = true;

      // get nested schema
      // for each nested field, get field object by calling createField recursively
      field.nestedFields = getFieldNames(this.props, this.getDocument(), {
        schema: field.nestedSchema,
        addExtraFields: false,
      }).map((subFieldName) => {
        return this.createField(
          subFieldName,
          field.nestedSchema,
          fieldName,
          field.path
        );
      });
    }
    return field;
  };

  /*
  Given a field's name, the containing schema, and parent, create the
  complete field object to be passed to the component

  */
  createField = (
    fieldName: string,
    schema: any,
    parentFieldName?: string,
    parentPath?: string
  ): FormField => {
    const fieldSchema = schema[fieldName];
    let field = this.initField(fieldName, fieldSchema);
    field = this.handleFieldPath(field, fieldName, parentPath);
    field = this.handleFieldParent(field, parentFieldName);
    field = this.handlePermissions(field, fieldName, schema);
    field = this.handleFieldChildren(field, fieldName, fieldSchema, schema);
    return field;
  };
  createArraySubField = (fieldName, subFieldSchema, schema) => {
    const subFieldName = `${fieldName}.$`;
    let subField = this.initField(subFieldName, subFieldSchema);
    // array subfield has the same path and permissions as its parent
    // so we use parent name (fieldName) and not subfieldName
    subField = this.handleFieldPath(subField, fieldName);
    subField = this.handlePermissions(subField, fieldName, schema);
    // we do not allow nesting yet
    //subField = this.handleFieldChildren(field, fieldSchema)
    return subField;
  };

  /*

  Get a field's intl keys (useful for debugging)

  */
  getIntlKeys = (fieldName) => {
    const collectionName = this.props.model.name.toLowerCase();
    return getIntlKeys({
      fieldName: fieldName,
      collectionName,
      schema: this.state.flatSchema,
    });
  };

  /*

   Get a field's label

   */
  getLabel = (fieldName: string, fieldLocale?: string) => {
    const collectionName = this.props.model.name.toLowerCase();
    const label = formatLabel({
      intl: this.context,
      fieldName: fieldName,
      collectionName: collectionName,
      schema: this.state.flatSchema,
    });
    if (fieldLocale) {
      const intlFieldLocale = this.context.formatMessage({
        id: `locales.${fieldLocale}`,
        defaultMessage: fieldLocale,
      });
      return `${label} (${intlFieldLocale})`;
    } else {
      return label;
    }
  };

  /*

   Get a field's description

   (Same as getLabel but pass isDescription: true )
   */
  getDescription = (fieldName) => {
    const collectionName = this.props.model.name.toLowerCase();
    const description = getIntlLabel({
      intl: this.context,
      fieldName: fieldName,
      collectionName: collectionName,
      schema: this.state.flatSchema,
      isDescription: true,
    });
    return description || null;
  };

  /*

  Get a field option's label

  */
  getOptionLabel = (fieldName, option) => {
    const collectionName = this.props.model.name.toLowerCase();
    const intlId =
      option.intlId || `${collectionName}.${fieldName}.${option.value}`;
    return this.context.formatMessage({
      id: intlId,
      defaultMessage: option.label,
    });
  };

  // --------------------------------------------------------------------- //
  // ------------------------------- Errors ------------------------------ //
  // --------------------------------------------------------------------- //

  /*

  Add error to form state

  Errors can have the following properties:
    - id: used as an internationalization key, for example `errors.required`
    - path: for field-specific errors, the path of the field with the issue
    - properties: additional data. Will be passed to vulcan-i18n as values
    - message: if id cannot be used as i81n key, message will be used

  */
  throwError = (error) => {
    let formErrors = getErrors(error);

    // eslint-disable-next-line no-console
    console.log(formErrors);

    // add error(s) to state
    this.setState((prevState) => ({
      errors: [...prevState.errors, ...formErrors],
    }));
  };

  /*

  Clear errors for a field

  */
  clearFieldErrors = (path) => {
    this.setState((prevState) => ({
      errors: prevState.errors.filter((error) => error.path !== path),
    }));
  };

  // --------------------------------------------------------------------- //
  // ------------------------------- Context ----------------------------- //
  // --------------------------------------------------------------------- //

  // add something to deleted values
  addToDeletedValues = (name) => {
    this.setState((prevState) => ({
      deletedValues: [...prevState.deletedValues, name],
    }));
  };

  // add a callback to the form submission
  addToSubmitForm = (callback) => {
    this.submitFormCallbacks.push(callback);
  };

  // add a callback to form submission success
  addToSuccessForm = (callback) => {
    this.successFormCallbacks.push(callback);
  };

  // add a callback to form submission failure
  addToFailureForm = (callback) => {
    this.failureFormCallbacks.push(callback);
  };

  clearFormCallbacks = () => {
    this.submitFormCallbacks = [];
    this.successFormCallbacks = [];
    this.failureFormCallbacks = [];
  };

  setFormState = (fn) => {
    this.setState(fn);
  };

  submitFormContext = (newValues) => {
    // keep the previous ones and extend (with possible replacement) with new ones
    this.setState(
      (prevState) => ({
        currentValues: {
          ...prevState.currentValues,
          ...newValues,
        }, // Submit form after setState update completed
      }),
      () => this.submitForm()
    );
  };

  // --------------------------------------------------------------------- //
  // ------------------------------ Lifecycle ---------------------------- //
  // --------------------------------------------------------------------- //

  /*

  When props change, reinitialize the form  state
  Triggered only for data related props (collection, document, currentUser etc.)

  @see https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  */
  UNSAFE_componentWillReceiveProps(nextProps) {
    const needReset = !!RESET_PROPS.find(
      (prop) => !isEqual(this.props[prop], nextProps[prop])
    );
    if (needReset) {
      const newState = getInitialStateFromProps(nextProps);
      this.setState(newState);
      if (nextProps.initCallback)
        nextProps.initCallback(newState.currentDocument);
    }
  }

  /*

  Manually update the current values of one or more fields(i.e. on change or blur).

  */
  updateCurrentValues = (newValues, options: { mode?: string } = {}) => {
    // default to overwriting old value with new
    const { mode = "overwrite" } = options;
    const { changeCallback } = this.props;

    // keep the previous ones and extend (with possible replacement) with new ones
    this.setState((prevState) => {
      // keep only the relevant properties
      const newState = {
        currentValues: cloneDeep(prevState.currentValues),
        currentDocument: cloneDeep(prevState.currentDocument),
        deletedValues: cloneDeep(prevState.deletedValues),
      };

      Object.keys(newValues).forEach((key) => {
        const path = key;
        let value = newValues[key];

        if (isEmptyValue(value)) {
          // delete value
          unset(newState.currentValues, path);
          set(newState.currentDocument, path, null);
          newState.deletedValues = [...newState.deletedValues, path];
        } else {
          // 1. update currentValues
          set(newState.currentValues, path, value);

          // 2. update currentDocument
          // For arrays and objects, give option to merge instead of overwrite
          if (mode === "merge" && (Array.isArray(value) || isObject(value))) {
            const oldValue = get(newState.currentDocument, path);
            set(newState.currentDocument, path, merge(oldValue, value));
          } else {
            set(newState.currentDocument, path, value);
          }

          // 3. in case value had previously been deleted, "undelete" it
          newState.deletedValues = without(newState.deletedValues, path);
        }
      });
      if (changeCallback) changeCallback(newState.currentDocument);
      return newState;
    });
  };

  /*

  Install a route leave hook to warn the user if there are unsaved changes

  */
  componentDidMount = () => {
    this.checkRouteChange();
    this.checkBrowserClosing();
  };

  /*
  Remove the closing browser check on component unmount
  see https://gist.github.com/mknabe/bfcb6db12ef52323954a28655801792d
  */
  componentWillUnmount = () => {
    if (this.getWarnUnsavedChanges()) {
      // unblock route change
      if (this.unblock) {
        this.unblock();
      }
      // unblock browser change
      // @ts-ignore
      window.onbeforeunload = undefined; //undefined instead of null to support IE
    }
  };

  // -------------------- Check on form leaving ----- //

  /**
   * Check if we must warn user on unsaved change
   */
  getWarnUnsavedChanges = () => {
    //let warnUnsavedChanges = getSetting("forms.warnUnsavedChanges");
    return this.props.warnUnsavedChanges;
  };

  // check for route change, prevent form content loss
  checkRouteChange = () => {
    // @see https://github.com/ReactTraining/react-router/issues/4635#issuecomment-297828995
    // @see https://github.com/ReactTraining/history#blocking-transitions
    if (this.getWarnUnsavedChanges()) {
      this.unblock = this.props.history.block((location, action) => {
        // return the message that will pop into a window.confirm alert
        // if returns nothing, the message won't appear and the user won't be blocked
        return this.handleRouteLeave();

        /*
            // React-router 3 implementtion
            const routes = this.props.router.routes;
            const currentRoute = routes[routes.length - 1];
            this.props.router.setRouteLeaveHook(currentRoute, this.handleRouteLeave);

            */
      });
    }
  };
  // check for browser closing
  checkBrowserClosing = () => {
    //check for closing the browser with unsaved changes too
    window.onbeforeunload = this.handlePageLeave;
  };

  /*
  Check if the user has unsaved changes, returns a message if yes
  and nothing if not
  */
  handleRouteLeave = () => {
    if (this.isChanged()) {
      const message = this.context.formatMessage({
        id: "forms.confirm_discard",
        defaultMessage: "Are you sure you want to discard your changes?",
      });
      return message;
    }
  };

  /**
   * Same for browser closing
   *
   * see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
   * the message returned is actually ignored by most browsers and a default message 'Are you sure you want to leave this page? You might have unsaved changes' is displayed. See the Notes section on the mozilla docs above
   */
  handlePageLeave = (event) => {
    if (this.isChanged()) {
      const message = this.context.formatMessage({
        id: "forms.confirm_discard",
        defaultMessage: "Are you sure you want to discard your changes?",
      });
      if (event) {
        event.returnValue = message;
      }

      return message;
    }
  };
  /*

  Returns true if there are any differences between the initial document and the current one

  */
  isChanged = () => {
    const initialDocument = this.state.initialDocument;
    const changedDocument = this.getDocument();

    const changedValue = find(changedDocument, (value, key, collection) => {
      return !isEqualWith(value, initialDocument[key], (objValue, othValue) => {
        if (!objValue && !othValue) return true;
      });
    });

    return typeof changedValue !== "undefined";
  };

  /*

  Refetch the document from the database (in case it was updated by another process or to reset the form)

  */
  refetchForm = () => {
    if (this.props.refetch) {
      this.props.refetch();
    }
  };

  /**
   * Clears form errors and values.
   *
   * @example Clear form
   *  // form will be fully emptied, with exception of prefilled values
   *  clearForm({ document: {} });
   *
   * @example Reset/revert form
   *  // form will be reverted to its initial state
   *  clearForm();
   *
   * @example Clear with new values
   *  // form will be cleared but initialized with the new document
   *  const document = {
   *    // ... some values
   *  };
   *  clearForm({ document });
   *
   * @param {Object=} options
   * @param {Object=} options.document
   *  Document to use as new initial document when values are cleared instead of
   *  the existing one. Note that prefilled props will be merged
   */
  clearForm = (options: { document?: any } = {}) => {
    const { document: optionsDocument } = options;
    const document = optionsDocument
      ? merge({}, this.props.prefilledProps, optionsDocument)
      : null;
    this.setState((prevState) => ({
      errors: [],
      currentValues: {},
      deletedValues: [],
      currentDocument: document || prevState.initialDocument,
      initialDocument: document || prevState.initialDocument,
      disabled: false,
    }));
  };

  newMutationSuccessCallback = (result) => {
    this.mutationSuccessCallback(result, "new");
  };

  editMutationSuccessCallback = (result) => {
    this.mutationSuccessCallback(result, "edit");
  };

  mutationSuccessCallback = (result, mutationType) => {
    this.setState((prevState) => ({ disabled: false, success: true }));
    let document = result.data[Object.keys(result.data)[0]].data; // document is always on first property

    // for new mutation, run refetch function if it exists
    if (mutationType === "new" && this.props.refetch) this.props.refetch();

    // call the clear form method (i.e. trigger setState) only if the form has not been unmounted
    // (we are in an async callback, everything can happen!)
    if (this.form) {
      this.clearForm({
        document: mutationType === "edit" ? document : undefined,
      });
    }

    // run document through mutation success callbacks
    document = runCallbacks({
      callbacks: this.successFormCallbacks,
      iterator: document,
      args: [{ form: this }],
    });

    // run success callback if it exists
    if (this.props.successCallback)
      this.props.successCallback(document, { form: this });
  };

  // catch graphql errors
  mutationErrorCallback = (document, error) => {
    this.setState((prevState) => ({ disabled: false }));

    // eslint-disable-next-line no-console
    console.log("// graphQL Error");
    // eslint-disable-next-line no-console
    console.log(error);

    // run mutation failure callbacks on error, we do not allow the callbacks to change the error
    runCallbacks({
      callbacks: this.failureFormCallbacks,
      iterator: error,
      args: [{ error, form: this }],
    });

    if (!_.isEmpty(error)) {
      // add error to state
      this.throwError(error);
    }

    // run error callback if it exists
    if (this.props.errorCallback)
      this.props.errorCallback(document, error, { form: this });

    // scroll back up to show error messages
    // TODO: migrate this to scroll on top of the form
    //Utils.scrollIntoView(".flash-message");
  };

  /*

  Submit form handler

  */
  submitForm = async (event?: Event) => {
    event && event.preventDefault();
    event && event.stopPropagation();

    const { contextName } = this.props;

    // if form is disabled (there is already a submit handler running) don't do anything
    if (this.state.disabled) {
      return;
    }

    // clear errors and disable form while it's submitting
    this.setState((prevState) => ({ errors: [], disabled: true }));

    // complete the data with values from custom components
    // note: it follows the same logic as SmartForm's getDocument method
    let data = this.getData({ replaceIntlFields: true, addExtraFields: false });

    // if there's a submit callback, run it
    if (this.props.submitCallback) {
      data = this.props.submitCallback(data) || data;
    }

    if (this.getFormType() === "new") {
      // create document form
      try {
        const result = await this.props.createDocument({
          input: {
            data,
            contextName,
          },
        });
        // TODO: what to do with this?
        const meta = this.props.createDocumentMeta;
        // in new versions of Apollo Client errors are no longer thrown/caught
        // but can instead be provided as props by the useMutation hook
        if (meta?.error) {
          this.mutationErrorCallback(document, meta.error);
        } else {
          this.newMutationSuccessCallback(result);
        }
      } catch (error) {
        this.mutationErrorCallback(document, error);
      }
    } else {
      // update document form
      try {
        const documentId = this.getDocument()._id;
        const result = await this.props.updateDocument({
          input: {
            id: documentId,
            data,
            contextName,
          },
        });
        // TODO: ?? what is Meta?
        const meta = this.props.updateDocumentMeta;
        // in new versions of Apollo Client errors are no longer thrown/caught
        // but can instead be provided as props by the useMutation hook
        if (meta.error) {
          this.mutationErrorCallback(document, meta.error);
        } else {
          this.editMutationSuccessCallback(result);
        }
      } catch (error) {
        this.mutationErrorCallback(document, error);
      }
    }
  };

  /*

  Delete document handler

  */
  deleteDocument = () => {
    const document = this.getDocument();
    const documentId = this.props.document._id;
    const documentTitle = document.title || document.name || "";

    const deleteDocumentConfirm = this.context.formatMessage(
      { id: "forms.delete_confirm" },
      { title: documentTitle }
    );

    if (window.confirm(deleteDocumentConfirm)) {
      this.props
        .deleteDocument({ input: { id: documentId } })
        .then((mutationResult) => {
          // the mutation result looks like {data:{collectionRemove: null}} if succeeded
          if (this.props.removeSuccessCallback)
            this.props.removeSuccessCallback({ documentId, documentTitle });
          if (this.props.refetch) this.props.refetch();
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.log(error);
        });
    }
  };

  // --------------------------------------------------------------------- //
  // ------------------------- Props to Pass ----------------------------- //
  // --------------------------------------------------------------------- //

  getCommonProps = () => {
    const { errors, currentValues, deletedValues, disabled } = this.state;
    const {
      currentUser,
      prefilledProps,
      formComponents,
      itemProperties,
      contextName,
    } = this.props;
    return {
      errors,
      throwError: this.throwError,
      document: this.getDocument(),
      currentValues,
      updateCurrentValues: this.updateCurrentValues,
      deletedValues,
      addToDeletedValues: this.addToDeletedValues,
      clearFieldErrors: this.clearFieldErrors,
      formType: this.getFormType(),
      currentUser,
      disabled,
      prefilledProps,
      formComponents: this.getMergedComponents(),
      FormComponents: this.getMergedComponents(),
      itemProperties,
      submitForm: this.submitForm,
      contextName,
    };
  };

  getFormProps = () => {
    const docClassName = `document-${this.getFormType()}`;
    const modelName = this.props.model.name.toLowerCase();

    return {
      className: `${docClassName} ${docClassName}-${modelName}`,
      id: this.props.id,
      onSubmit: this.submitForm,
      ref: (e) => {
        this.form = e;
      },
    };
  };

  getFormLayoutProps = () => {
    const { formComponents, repeatErrors } = this.props;
    const FormComponents = this.getMergedComponents();

    return {
      FormComponents,
      formProps: this.getFormProps(),
      errorProps: this.getFormErrorsProps(),
      repeatErrors: repeatErrors,
      submitProps: this.getFormSubmitProps(),
      commonProps: this.getCommonProps(),
    };
  };

  getFormErrorsProps = () => ({
    errors: this.state.errors,
  });

  getFormGroupProps = (group) => ({
    key: group.name,
    ...group,
    group: omit(group, ["fields"]),
    ...this.getCommonProps(),
  });

  getFormSubmitProps = () => {
    const {
      submitLabel,
      cancelLabel,
      revertLabel,
      cancelCallback,
      revertCallback,
    } = this.props;
    const { currentValues, deletedValues, errors } = this.state;
    return {
      submitForm: this.submitForm,
      submitLabel,
      cancelLabel,
      revertLabel,
      cancelCallback,
      revertCallback,
      document: this.getDocument(),
      deleteDocument:
        (this.getFormType() === "edit" &&
          this.props.showRemove &&
          this.props.showDelete &&
          this.deleteDocument) ||
        null,
      currentValues,
      deletedValues,
      errors,
    };
  };

  // --------------------------------------------------------------------- //
  // ----------------------------- Render -------------------------------- //
  // --------------------------------------------------------------------- //

  render() {
    const { successComponent, document, currentUser } = this.props;
    const { schema, initialDocument } = this.state;
    const FormComponents = this.getMergedComponents();

    /*
  If a document is being passed, this is an edit form
  */
    //getFormType = () => {
    //  return this.props.document ? "edit" : "new";
    //};
    const formType: "edit" | "new" = document ? "edit" : "new";

    /*
  Get a list of all insertable fields
  */
    // getInsertableFields = (schema) => {
    //   return getInsertableFields(
    //     schema || this.state.schema,
    //     this.props.currentUser
    //   );
    // };
    const insertableFields = getInsertableFields(schema, currentUser);

    /*
  Get a list of all editable fields
  */
    //getEditableFields = (schema) => {
    //  return getEditableFields(
    //    schema || this.state.schema,
    //    this.props.currentUser,
    //    this.state.initialDocument
    //  );
    //};
    const editableFields = getEditableFields(
      schema,
      currentUser,
      initialDocument
    );

    /*

  Get a list of all mutable (insertable/editable depending on current form type) fields

  */
    // getMutableFields = (schema) => {
    //   return this.getFormType() === "edit"
    //     ? this.getEditableFields(schema)
    //     : this.getInsertableFields(schema);
    // };
    const mutableFields =
      formType === "edit" ? editableFields : insertableFields;

    return this.state.success && successComponent ? (
      successComponent
    ) : (
      <FormContext.Provider
        value={{
          throwError: this.throwError,
          clearForm: this.clearForm,
          refetchForm: this.refetchForm,
          isChanged: this.isChanged,
          submitForm: this.submitFormContext, //Change in name because we already have a function
          // called submitForm, but no reason for the user to know
          // about that
          addToDeletedValues: this.addToDeletedValues,
          updateCurrentValues: this.updateCurrentValues,
          getDocument: this.getDocument,
          getLabel: this.getLabel,
          initialDocument: this.state.initialDocument,
          setFormState: this.setFormState,
          addToSubmitForm: this.addToSubmitForm,
          addToSuccessForm: this.addToSuccessForm,
          addToFailureForm: this.addToFailureForm,
          clearFormCallbacks: this.clearFormCallbacks,
          errors: this.state.errors,
          currentValues: this.state.currentValues,
          deletedValues: this.state.deletedValues,
        }}
      >
        <FormComponents.FormLayout {...this.getFormLayoutProps()}>
          {this.getFieldGroups().map((group, i) => (
            <FormComponents.FormGroup
              key={i}
              {...this.getFormGroupProps(group)}
            />
          ))}
        </FormComponents.FormLayout>
      </FormContext.Provider>
    );
  }
}

export default Form;
