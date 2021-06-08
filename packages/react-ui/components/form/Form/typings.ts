import { MutationResult } from "@apollo/client";
import { VulcanModel } from "@vulcanjs/model";
import { User } from "@vulcanjs/permissions";
import { VulcanSchema } from "@vulcanjs/schema/dist/typings";

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
export interface FormProps<TModel = { [key in string]: any }> {
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
  /**
   * Called on document creation
   * The result should have the same shape as the result of the graphql create mutation:
   * { result: { data: { foo: {...}}}}
   */
  createDocument: <TData = Object>(createArgs: {
    input: {
      data: any;
      contextName?: string;
    };
  }) => Promise<MutationResult<TData>>;
  updateDocument: Function;
  deleteDocument: Function;
  // ??
  createDocumentMeta?: { error?: any };
  updateDocumentMeta?: { error?: any };
  // EXPERIMENTAL: allowing to manually set the form children
  children?: React.ReactNode;
}
