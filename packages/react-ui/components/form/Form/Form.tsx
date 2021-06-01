/*

Main form component.

This component expects:

### All Forms:

- collection
- currentUser
- client (Apollo client)

*/

import React, { Component, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { runCallbacks, getErrors } from "@vulcanjs/core";
import { IntlProviderContext, useIntlContext } from "@vulcanjs/i18n";
import { removeProperty } from "@vulcanjs/utils";
import _filter from "lodash/filter";
import cloneDeep from "lodash/cloneDeep";
import compact from "lodash/compact";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import isObject from "lodash/isObject";
import mapValues from "lodash/mapValues";
import merge from "lodash/merge";
import omit from "lodash/omit";
import omitBy from "lodash/omitBy";
import pick from "lodash/pick";
import pickBy from "lodash/pickBy";
import set from "lodash/set";
import unset from "lodash/unset";
import update from "lodash/update";
import without from "lodash/without";

import {
  convertSchema,
  getEditableFields,
  getInsertableFields,
} from "../modules/schema_utils";
import { isEmptyValue } from "../modules/utils";
import { getParentPath } from "../modules/path_utils";
// import withCollectionProps from "./withCollectionProps";
import { callbackProps } from "../propTypes";
import _ from "underscore";
import { VulcanModel } from "@vulcanjs/model";
import { VulcanSchema } from "@vulcanjs/schema";
import { User } from "@vulcanjs/permissions";
import {
  defaultVulcanComponents,
  PossibleFormComponents,
} from "../defaultVulcanComponents";
import { FormContext } from "../FormContext";
import { FormLayoutProps } from "../FormLayout";
import { FormSubmitProps } from "../FormSubmit";
import { getFieldGroups, getFieldNames, getLabel } from "./fields";
import { isNotSameDocument } from "./utils";
import { useWarnOnUnsaved } from "../useWarnOnUnsaved";
import { useVulcanComponents } from "../VulcanComponentsContext";

type FormType = "new" | "edit";

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

const getInitialStateFromProps = (nextProps: FormProps): FormState => {
  const schema = nextProps.schema || nextProps.model.schema;
  const convertedSchema = convertSchema(schema);
  const formType: FormType = nextProps.document ? "edit" : "new";
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

const getChildrenProps = (
  props: FormProps,
  state: Pick<FormState, "disabled" | "currentDocument">,
  options: { formType: FormType },
  // TODO: that belongs to the context instead
  callbacks: { deleteDocument: Function }
): {
  formLayoutProps: FormLayoutProps;
  formGroupProps: Function;
  commonProps: any;
  formSubmitProps: FormSubmitProps;
} => {
  const {
    currentUser,
    repeatErrors,
    submitLabel,
    cancelLabel,
    revertLabel,
    cancelCallback,
    revertCallback,
    id,
    model,
    prefilledProps,
    itemProperties,
    contextName,
    showRemove,
    showDelete,
  } = props;
  const { disabled, currentDocument } = state;
  const { formType } = options;
  const { deleteDocument } = callbacks;
  const commonProps = {
    document: currentDocument,
    formType,
    currentUser,
    disabled,
    prefilledProps,
    itemProperties,
    contextName,
  };

  const docClassName = `document-${formType}`;
  const modelName = model.name.toLowerCase();
  const formProps = {
    className: `${docClassName} ${docClassName}-${modelName}`,
    id: id,
    // It's the form element responsibility to get submitForm from context
    // onSubmit: this.submitForm(formType),
    // TODO: update to useRef
    //ref: (e) => {
    //  this.form = e;
    //},
  };

  const formGroupProps = (group) => ({
    key: group.name,
    ...group,
    group: omit(group, ["fields"]),
    ...commonProps,
  });

  const formSubmitProps = {
    model,
    currentUser,
    submitLabel,
    cancelLabel,
    revertLabel,
    cancelCallback,
    revertCallback,
    document: currentDocument,
    // TODO: should probably be passed through context
    deleteDocument:
      (formType === "edit" && showRemove && showDelete && deleteDocument) ||
      null,
  };

  const formLayoutProps = {
    formProps: formProps,
    repeatErrors: repeatErrors,
    submitProps: formSubmitProps,
    commonProps,
  };
  return {
    commonProps,
    formSubmitProps,
    formGroupProps,
    formLayoutProps,
  };
};

// component form until we go stateless
const FormWarnUnsaved = ({
  isChanged,
  warnUnsavedChanges,
  children,
}: {
  isChanged: boolean;
  warnUnsavedChanges?: boolean;
  children: React.ReactNode;
}) => {
  useWarnOnUnsaved({
    isChanged,
    warnUnsavedChanges,
  });
  return <>{children}</>;
};

/*

  Like getDocument, but cross-reference with getFieldNames()
  to only return fields that actually need to be submitted

  Also remove any deleted values.

  */
const getData = (
  customArgs,
  props: FormProps,
  state: Pick<FormState, "currentDocument" | "deletedValues">,
  // previously from "this" object
  { submitFormCallbacks, form }: any
) => {
  const { currentDocument } = state;
  const { prefilledProps } = props;
  // we want to keep prefilled data even for hidden/removed fields
  let data = prefilledProps || {};

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
  const fields = getFieldNames(props, currentDocument, args);
  data = { ...data, ...pick(currentDocument, ...fields) };

  // compact deleted values
  state.deletedValues.forEach((path) => {
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
    callbacks: submitFormCallbacks,
    iterator: data,
    args: [
      {
        /*form: this*/
      },
    ],
  });

  return data;
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
  refetch?: Function;
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
  addFields?: Array<string>;
  removeFields?: Array<string>;
  // deprecated
  //hideFields?: any;
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
  /** Callback ran on first render */
  initCallback?: Function;
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

export const Form = (props: FormProps) => {
  const { initCallback } = props;
  const initialState = getInitialStateFromProps(props);
  const { schema, originalSchema, flatSchema } = initialState;
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false; // toggle flag after first render/mounting
      return;
    }
    if (initCallback) initCallback(initialState.currentDocument);
  }, [initCallback]);
  const defaultProps = {
    layout: "horizontal",
    prefilledProps: {},
    repeatErrors: false,
    showRemove: true,
    showDelete: true,
  };
  const allProps = { ...defaultProps, ...props };
  const defaultValues = {};
  const submitFormCallbacks: Array<Function> = [];
  const successFormCallbacks: Array<Function> = [];
  const failureFormCallbacks: Array<Function> = [];
  const intl = useIntlContext();

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
  const [errors, setErrors] = useState<Array<any>>([]);
  const throwError = (error) => {
    let formErrors = getErrors(error);

    // eslint-disable-next-line no-console
    console.log(formErrors);

    // add error(s) to state
    setErrors((prevErrors) => [...prevErrors, ...formErrors]);
  };

  /*

  Clear errors for a field

  */
  const clearFieldErrors = (path) => {
    setErrors((prevErrors) =>
      prevErrors.filter((error) => error.path !== path)
    );
  };

  // --------------------------------------------------------------------- //
  // ------------------------------- Context ----------------------------- //
  // --------------------------------------------------------------------- //

  const [deletedValues, setDeletedValues] = useState<Array<any>>([]);

  // add something to deleted values
  const addToDeletedValues = (name) => {
    setDeletedValues((prevDeletedValues) => [...prevDeletedValues, name]);
  };

  const [callbacks, setCallbacks] = useState({
    submitFormCallbacks: [],
    successFormCallbacks: [],
    failureFormCallbacks: [],
  });
  // add a callback to the form submission
  const addToSubmitForm = (callback) => {
    setCallbacks((cbs) => ({
      ...cbs,
      submitFormCallbacks: [...cbs.submitFormCallbacks, callback],
    }));
  };

  // add a callback to form submission success
  const addToSuccessForm = (callback) => {
    setCallbacks((cbs) => ({
      ...cbs,
      successFormCallbacks: [...cbs.successFormCallbacks, callback],
    }));
  };

  // add a callback to form submission failure
  const addToFailureForm = (callback) => {
    setCallbacks((cbs) => ({
      ...cbs,
      failureFormCallbacks: [...cbs.failureFormCallbacks, callback],
    }));
  };

  const clearFormCallbacks = () => {
    setCallbacks({
      submitFormCallbacks: [],
      successFormCallbacks: [],
      failureFormCallbacks: [],
    });
  };

  /*
  setFormState = (fn) => {
    this.setState(fn);
  };
  */

  const [currentValues, setCurrentValues] = useState<Object>({});

  const submitFormContext = (formType: FormType) => (newValues) => {
    setCurrentValues((prevCurrentValues) => ({
      ...prevCurrentValues,
      ...newValues,
    }));
    // TODO: previously, this was using a callback from setCurrentValues
    // this needs to be rearchitectured to work without, will need some check
    // https://stackoverflow.com/questions/56247433/how-to-use-setstate-callback-on-react-hooks
    submitForm(formType)();
  };

  // --------------------------------------------------------------------- //
  // ------------------------------ Lifecycle ---------------------------- //
  // --------------------------------------------------------------------- //

  /*

  When props change, reinitialize the form  state
  Triggered only for data related props (collection, document, currentUser etc.)

  @see https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html

  */
  /*
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
  }*/

  const [currentDocument, setCurrentDocument] = useState<{
    title?: string;
    _id?: string;
    name?: string;
  }>({});

  /*

  Manually update the current values of one or more fields(i.e. on change or blur).

  */
  const updateCurrentValues = (newValues, options: { mode?: string } = {}) => {
    // default to overwriting old value with new
    const { mode = "overwrite" } = options;
    const { changeCallback } = props;

    // keep the previous ones and extend (with possible replacement) with new ones
    // keep only the relevant properties
    const newState = {
      currentValues: cloneDeep(currentValues),
      currentDocument: cloneDeep(currentDocument),
      deletedValues: cloneDeep(deletedValues),
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

    // TODO: prefer  a reducer
    setCurrentValues(newState.currentValues);
    setCurrentDocument(newState.currentDocument);
    setDeletedValues(newState.deletedValues);
  };

  /*

  Refetch the document from the database (in case it was updated by another process or to reset the form)

  */
  const refetchForm = () => {
    if (props.refetch) {
      props.refetch();
    }
  };

  const [initialDocument, setInitialDocument] = useState<Object>({});
  const [disabled, setDisabled] = useState<boolean>(false); // TODO
  const [success, setSuccess] = useState<boolean>(false); // TODO
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
  const clearForm = (options: { document?: any } = {}) => {
    const { document: optionsDocument } = options;
    const document = optionsDocument
      ? merge({}, props.prefilledProps, optionsDocument)
      : null;
    // TODO: prefer a reducer
    setErrors([]);
    setCurrentValues({});
    setDeletedValues([]);
    setCurrentDocument(document || initialDocument);
    setInitialDocument(document || initialDocument);
    setDisabled(false);
  };

  const newMutationSuccessCallback = (result) => {
    mutationSuccessCallback(result, "new");
  };

  const editMutationSuccessCallback = (result) => {
    mutationSuccessCallback(result, "edit");
  };

  const formRef = useRef(null);
  const mutationSuccessCallback = (result, mutationType) => {
    // TODO: use a reducer
    setDisabled(true);
    setSuccess(true);
    let document = result.data[Object.keys(result.data)[0]].data; // document is always on first property

    // for new mutation, run refetch function if it exists
    if (mutationType === "new" && props.refetch) props.refetch();

    // call the clear form method (i.e. trigger setState) only if the form has not been unmounted
    // (we are in an async callback, everything can happen!)
    // TODO: this should rely on a ref
    if (formRef.current) {
      clearForm({
        document: mutationType === "edit" ? document : undefined,
      });
    }

    // run document through mutation success callbacks
    document = runCallbacks({
      callbacks: successFormCallbacks,
      iterator: document,
      args: [{ form: formRef.current }],
    });

    // run success callback if it exists
    if (props.successCallback) props.successCallback(document, { form: this });
  };

  // catch graphql errors
  const mutationErrorCallback = (document, error) => {
    setDisabled(false);

    // eslint-disable-next-line no-console
    console.log("// graphQL Error");
    // eslint-disable-next-line no-console
    console.log(error);

    // run mutation failure callbacks on error, we do not allow the callbacks to change the error
    runCallbacks({
      callbacks: failureFormCallbacks,
      iterator: error,
      args: [{ error, form: formRef.current }],
    });

    if (!_.isEmpty(error)) {
      // add error to state
      throwError(error);
    }

    // run error callback if it exists
    if (props.errorCallback)
      props.errorCallback(document, error, { form: this });

    // scroll back up to show error messages
    // TODO: migrate this to scroll on top of the form
    //Utils.scrollIntoView(".flash-message");
  };

  /*

  Submit form handler

  */
  const submitForm = (formType: FormType) => async (event?: Event) => {
    event && event.preventDefault();
    event && event.stopPropagation();

    const { contextName } = props;

    // if form is disabled (there is already a submit handler running) don't do anything
    if (disabled) {
      return;
    }

    // clear errors and disable form while it's submitting
    setErrors([]);
    setDisabled(true);

    // complete the data with values from custom components
    // note: it follows the same logic as SmartForm's getDocument method
    let data = getData(
      { replaceIntlFields: true, addExtraFields: false },
      props,
      {
        currentDocument,
        deletedValues,
      },
      { form: formRef.current, submitFormCallbacks }
    );

    // if there's a submit callback, run it
    if (props.submitCallback) {
      data = props.submitCallback(data) || data;
    }

    if (formType === "new") {
      // create document form
      try {
        const result = await props.createDocument({
          input: {
            data,
            contextName,
          },
        });
        // TODO: what to do with this?
        const meta = props.createDocumentMeta;
        // in new versions of Apollo Client errors are no longer thrown/caught
        // but can instead be provided as props by the useMutation hook
        if (meta?.error) {
          mutationErrorCallback(document, meta.error);
        } else {
          newMutationSuccessCallback(result);
        }
      } catch (error) {
        mutationErrorCallback(document, error);
      }
    } else {
      // update document form
      try {
        const documentId = currentDocument._id;
        const result = await props.updateDocument({
          input: {
            id: documentId,
            data,
            contextName,
          },
        });
        // TODO: ?? what is Meta?
        const meta = props.updateDocumentMeta;
        // in new versions of Apollo Client errors are no longer thrown/caught
        // but can instead be provided as props by the useMutation hook
        if (meta?.error) {
          mutationErrorCallback(document, meta.error);
        } else {
          editMutationSuccessCallback(result);
        }
      } catch (error) {
        mutationErrorCallback(document, error);
      }
    }
  };

  /*

  Delete document handler

  */
  const deleteDocument = () => {
    const document = currentDocument;
    const documentId = props.document._id;
    const documentTitle = document.title || document.name || "";

    const deleteDocumentConfirm = intl.formatMessage(
      { id: "forms.delete_confirm" },
      { title: documentTitle }
    );

    if (window.confirm(deleteDocumentConfirm)) {
      props
        .deleteDocument({ input: { id: documentId } })
        .then((mutationResult) => {
          // the mutation result looks like {data:{collectionRemove: null}} if succeeded
          if (props.removeSuccessCallback)
            props.removeSuccessCallback({ documentId, documentTitle });
          if (props.refetch) props.refetch();
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

  // --------------------------------------------------------------------- //
  // ----------------------------- Render -------------------------------- //
  // --------------------------------------------------------------------- //

  const { successComponent, document, currentUser, model, warnUnsavedChanges } =
    props;
  const FormComponents = useVulcanComponents();

  const formType: "edit" | "new" = document ? "edit" : "new";

  // Fields computation
  const mutableFields =
    formType === "edit"
      ? getEditableFields(schema, currentUser, initialDocument)
      : getInsertableFields(schema, currentUser);

  const { formLayoutProps, formGroupProps } = getChildrenProps(
    props,
    { disabled, currentDocument },
    {
      formType,
    },
    {
      deleteDocument,
    }
  );
  const isChanged = isNotSameDocument(initialDocument, currentDocument);

  return success && successComponent ? (
    successComponent
  ) : (
    <FormWarnUnsaved
      isChanged={isChanged}
      warnUnsavedChanges={warnUnsavedChanges}
    >
      <FormContext.Provider
        value={{
          throwError,
          clearForm,
          refetchForm,
          isChanged,
          submitForm: submitFormContext(formType), //Change in name because we already have a function
          // called submitForm, but no reason for the user to know
          // about that
          addToDeletedValues: addToDeletedValues,
          updateCurrentValues: updateCurrentValues,
          getDocument: () => currentDocument,
          getLabel: (fieldName, fieldLocale) =>
            getLabel(model, flatSchema, intl, fieldName, fieldLocale),
          initialDocument: initialDocument,
          // TODO BAD: check where used
          //setFormState: this.setFormState,
          addToSubmitForm,
          addToSuccessForm,
          addToFailureForm,
          clearFormCallbacks,
          errors,
          currentValues,
          deletedValues,
          clearFieldErrors,
        }}
      >
        <FormComponents.FormLayout {...formLayoutProps}>
          {getFieldGroups(
            props,
            {
              currentDocument,
              schema,
              flatSchema,
              originalSchema,
            },
            intl,
            mutableFields,
            intl.formatMessage
          ).map((group, i) => (
            <FormComponents.FormGroup key={i} {...formGroupProps(group)} />
          ))}
        </FormComponents.FormLayout>
      </FormContext.Provider>
    </FormWarnUnsaved>
  );
};

export default Form;