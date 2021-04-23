/**
 * TODO: rename "FieldComponent" to clarify
 * Change compared to Meteor:
 * - custom inputs cannot be a reference anymore, you need to pass the whole component and not just the name
 * - FormComponents context is limited to default component. Other components must be passed through the schema instead
 * (it means you can't extend the SmartForm with new inputType, instead use a fully custom input)
 */
import React, { Component } from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import SimpleSchema from "simpl-schema";
import { isEmptyValue, getNullValue } from "./modules/utils";
import { PossibleFormComponents } from "./defaultVulcanComponents";

// extract this as a pure function so that it can be used inside getDerivedStateFromProps
const getCharacterCounts = (value, max) => {
  const characterCount = value ? value.length : 0;
  return { charsRemaining: max - characterCount, charsCount: characterCount };
};

// If this is an intl input, get _intl field instead
// extract this as a pure function so that it can be used inside getDerivedStateFromProps
const getPath = (p) => {
  return p.intlInput ? `${p.path}_intl` : p.path;
};

type StandardInputType =
  | "text"
  | "password"
  | "number"
  | "url"
  | "email"
  | "textarea"
  | "checkbox"
  | "checkboxgroup"
  | "radiogroup"
  | "select"
  | "selectmultiple"
  | "datetime"
  | "date"
  | "date2"
  | "time"
  | "statictext"
  | "likert"
  | "autocomplete"
  | "multiautocomplete";

type Options<TField = any> = Array<{ label: string; value: TField }>;
export interface FormComponentProps<TField> {
  document: any;
  deletedValues: Array<string>;
  datatype: any; // TODO: type of the field, replace this by a cleaner value like we do in graphql to get the field type
  disabled: boolean;
  errors: Array<any>;
  /** Help text for the form */
  help: string;
  /** Path of the field if nested */
  path: string;
  defaultValue?: TField;
  max?: number;
  locale: string;
  /** Input for this field */
  input?: StandardInputType | React.Component;
  formType: "new" | "edit"; // new or edit
  intlInput?: boolean;
  nestedInput?: boolean;
  /** Graphql query you can pass to fetch the options asynchronously */
  query?: string;
  options?: Options | ((fciProps?: any) => Options);
  formComponents: PossibleFormComponents; // TODO: get from context after switching to a functional component

  updateCurrentValues: Function; // TODO: move this to context to avoid props drilling
  clearFieldErrors: Function;
}
interface FormComponentState {
  charsRemaining?: number;
}

/**
 * Component for the display of any field of the form
 */
class FormComponent<TField = any> extends Component<
  FormComponentProps<TField>,
  FormComponentState
> {
  constructor(props) {
    super(props);
    this.state = {};
  }
  static propTypes = {
    document: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.any,
    placeholder: PropTypes.string,
    prefilledValue: PropTypes.any,
    options: PropTypes.any,
    input: PropTypes.any,
    datatype: PropTypes.any,
    path: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    nestedSchema: PropTypes.object,
    currentValues: PropTypes.object.isRequired,
    deletedValues: PropTypes.array.isRequired,
    throwError: PropTypes.func.isRequired,
    updateCurrentValues: PropTypes.func.isRequired,
    errors: PropTypes.array.isRequired,
    addToDeletedValues: PropTypes.func,
    clearFieldErrors: PropTypes.func.isRequired,
    currentUser: PropTypes.object,
    prefilledProps: PropTypes.object,
  };

  static getDerivedStateFromProps(props) {
    const { document, max } = props;
    if (!max) {
      return null;
    }
    const path = getPath(props);
    const intlOrRegularValue = get(document, path);
    const value =
      intlOrRegularValue && typeof intlOrRegularValue === "object"
        ? intlOrRegularValue.value
        : intlOrRegularValue;
    return getCharacterCounts(value, max);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // allow custom controls to determine if they should update
    if (this.isCustomInput(this.getInputType(nextProps))) {
      return true;
    }

    const { document, deletedValues, errors } = nextProps;
    const path = getPath(this.props);

    // when checking for deleted values, both current path ('foo') and child path ('foo.0.bar') should trigger updates
    const includesPathOrChildren = (deletedValues) =>
      deletedValues.some((deletedPath) => deletedPath.includes(path));

    const valueChanged = !isEqual(
      get(document, path),
      get(this.props.document, path)
    );
    const errorChanged = !isEqual(this.getErrors(errors), this.getErrors());
    const deleteChanged =
      includesPathOrChildren(deletedValues) !==
      includesPathOrChildren(this.props.deletedValues);
    const charsChanged = nextState.charsRemaining !== this.state.charsRemaining;
    const disabledChanged = nextProps.disabled !== this.props.disabled;
    const helpChanged = nextProps.help !== this.props.help;

    const shouldUpdate =
      valueChanged ||
      errorChanged ||
      deleteChanged ||
      charsChanged ||
      disabledChanged ||
      helpChanged;

    return shouldUpdate;
  }

  /*

  Returns true if the passed input type is a custom

  */
  isCustomInput = (inputType) => {
    const isStandardInput = [
      "nested",
      "number",
      "url",
      "email",
      "textarea",
      "checkbox",
      "checkboxgroup",
      "radiogroup",
      "select",
      "selectmultiple",
      "datetime",
      "date",
      "time",
      "text",
      "password",
    ].includes(inputType);
    return !isStandardInput;
  };

  /*

  Function passed to form controls (always controlled) to update their value

  */
  handleChange = (value) => {
    // if value is an empty string, delete the field
    if (value === "") {
      value = null;
    }
    // if this is a number field, convert value before sending it up to Form
    if (this.getFieldType() === Number && value != null) {
      value = Number(value);
    } else if (this.getFieldType() === SimpleSchema.Integer && value != null) {
      value = parseInt(value);
    }

    if (value !== this.getValue()) {
      const updateValue = this.props.locale
        ? { locale: this.props.locale, value }
        : value;
      this.props.updateCurrentValues({ [getPath(this.props)]: updateValue });
      this.props.clearFieldErrors(getPath(this.props));
    }

    // for text fields, update character count on change
    if (this.showCharsRemaining()) {
      this.updateCharacterCount(value);
    }
  };

  /*

  Updates the state of charsCount and charsRemaining as the users types

  */
  updateCharacterCount = (value) => {
    this.setState(getCharacterCounts(value, this.props.max));
  };

  /*

  Get value from Form state through document and currentValues props

  */
  getValue = (props?: FormComponentProps<TField>, context?: any) => {
    const p = props || this.props;
    const c = context || this.context;
    const { locale, defaultValue, deletedValues, formType, datatype } = p;
    const path = locale ? `${getPath(p)}.value` : getPath(p);
    const currentDocument = c.getDocument();
    let value = get(currentDocument, path);
    // note: force intl fields to be treated like strings
    const nullValue = locale ? "" : getNullValue(datatype);

    // handle deleted & empty value
    if (deletedValues.includes(path)) {
      value = nullValue;
    } else if (isEmptyValue(value)) {
      // replace empty value by the default value from the schema if it exists – for new forms only
      value = formType === "new" && defaultValue ? defaultValue : nullValue;
    }
    return value;
  };

  /*

  Whether to keep track of and show remaining chars

  */
  showCharsRemaining = (props?: FormComponentProps<TField>) => {
    const p = props || this.props;
    const inputType = this.getInputType(p);
    if (typeof inputType !== "string") return false;
    return p.max && ["url", "email", "textarea", "text"].includes(inputType);
  };

  /*

  Get errors from Form state through context

  Note: we use `includes` to get all errors from nested components, which have longer paths

  */
  getErrors = (errors?: Array<any>) => {
    errors = errors || this.props.errors;
    const fieldErrors = errors.filter(
      (error) => error.path && error.path.includes(this.props.path)
    );
    return fieldErrors;
  };

  /*

  Get field field value type

  */
  getFieldType = (props?: FormComponentProps<TField>) => {
    const p = props || this.props;
    return p.datatype && p.datatype[0].type;
  };

  /*

  Get form input type, either based on input props, or by guessing based on form field type

  */
  getInputType = (
    props?: FormComponentProps<TField>
  ): FormComponentProps<TField>["input"] => {
    const p = props || this.props;
    const fieldType = this.getFieldType();
    const autoType =
      fieldType === Number || fieldType === SimpleSchema.Integer
        ? "number"
        : fieldType === Boolean
        ? "checkbox"
        : fieldType === Date
        ? "date"
        : "text";
    return p.input || autoType;
  };

  /*

  Function passed to form controls to clear their contents (set their value to null)

  */
  clearField = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.props.updateCurrentValues({ [this.props.path]: null });
    if (this.showCharsRemaining()) {
      this.updateCharacterCount(null);
    }
  };

  /*

  Function passed to FormComponentInner to help with rendering the component

  */
  getFormInput = () => {
    const inputType = this.getInputType();
    const FormComponents = this.props.formComponents;

    // if input is a React component, use it
    if (typeof this.props.input === "function") {
      const InputComponent = this.props.input;
      return InputComponent;
    } else {
      // else pick a predefined component

      switch (inputType) {
        case "text":
          return FormComponents.FormComponentDefault;

        case "password":
          return FormComponents.FormComponentPassword;

        case "number":
          return FormComponents.FormComponentNumber;

        case "url":
          return FormComponents.FormComponentUrl;

        case "email":
          return FormComponents.FormComponentEmail;

        case "textarea":
          return FormComponents.FormComponentTextarea;

        case "checkbox":
          return FormComponents.FormComponentCheckbox;

        case "checkboxgroup":
          return FormComponents.FormComponentCheckboxGroup;

        case "radiogroup":
          return FormComponents.FormComponentRadioGroup;

        case "select":
          return FormComponents.FormComponentSelect;

        case "selectmultiple":
          return FormComponents.FormComponentSelectMultiple;

        case "datetime":
          return FormComponents.FormComponentDateTime;

        case "date":
          return FormComponents.FormComponentDate;

        case "date2":
          return FormComponents.FormComponentDate2;

        case "time":
          return FormComponents.FormComponentTime;

        case "statictext":
          return FormComponents.FormComponentStaticText;

        case "likert":
          return FormComponents.FormComponentLikert;

        case "autocomplete":
          return FormComponents.FormComponentAutocomplete;

        case "multiautocomplete":
          return FormComponents.FormComponentMultiAutocomplete;

        default:
          const CustomComponent = this.props.input;
          return CustomComponent;
      }
    }
  };

  isArrayField = () => {
    return this.getFieldType() === Array;
  };

  isObjectField = () => {
    return this.getFieldType() instanceof SimpleSchema;
  };

  render() {
    const FormComponents = this.context.formComponents;

    if (this.props.intlInput) {
      return <FormComponents.FormIntl {...this.props} />;
    } else if (!this.props.input && this.props.nestedInput) {
      if (this.isArrayField()) {
        return (
          <FormComponents.FormNestedArray
            {...this.props}
            formComponents={FormComponents}
            errors={this.getErrors()}
            value={this.getValue()}
          />
        );
      } else if (this.isObjectField()) {
        return (
          <FormComponents.FormNestedObject
            {...this.props}
            formComponents={FormComponents}
            errors={this.getErrors()}
            value={this.getValue()}
          />
        );
      }
    }

    const fciProps = {
      ...this.props,
      ...this.state,
      inputType: this.getInputType(),
      value: this.getValue(),
      errors: this.getErrors(),
      document: this.context.getDocument(),
      showCharsRemaining: !!this.showCharsRemaining(),
      handleChange: this.handleChange,
      clearField: this.clearField,
      formInput: this.getFormInput(),
      formComponents: FormComponents,
    };

    // if there is no query, handle options here; otherwise they will be handled by
    // the FormComponentLoader component
    if (!this.props.query && typeof this.props.options === "function") {
      fciProps.options = this.props.options(fciProps);
    }

    const fci = <FormComponents.FormComponentInner {...fciProps} />;

    return this.props.query ? (
      <FormComponents.FormComponentLoader {...fciProps}>
        {fci}
      </FormComponents.FormComponentLoader>
    ) : (
      fci
    );
  }
}

FormComponent.contextType = {
  // @ts-expect-error
  getDocument: PropTypes.func.isRequired,
};

export const formComponentsDependencies = [
  "FormComponentDefault",
  "FormComponentPassword",
  "FormComponentNumber",
  "FormComponentUrl",
  "FormComponentEmail",
  "FormComponentTextarea",
  "FormComponentCheckbox",
  "FormComponentCheckboxGroup",
  "FormComponentRadioGroup",
  "FormComponentSelect",
  "FormComponentSelectMultiple",
  "FormComponentDateTime",
  "FormComponentDate",
  "FormComponentDate2",
  "FormComponentTime",
  "FormComponentStaticText",
  "FormComponentLikert",
  "FormComponentAutocomplete",
  "FormComponentMultiAutocomplete",
];
//module.exports = FormComponent;
export default FormComponent;
