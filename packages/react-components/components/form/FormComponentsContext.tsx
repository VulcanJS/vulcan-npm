/**
 * TODO: how to handle the fact that elements may be dependent on one another?
 * We might need some kind of cascading behaviour?
 */
import { deprecate } from "@vulcanjs/utils/debug";
import React, { useContext } from "react";

// TODO: differentiate components that are provided out of the box and those that require a UI frameworK?
export interface PossibleFormComponents {
  FormError: any; // FieldErrors
  // From FormComponent
  FormComponentDefault: any;
  FormComponentPassword: any;
  FormComponentNumber: any;
  FormComponentUrl: any;
  FormComponentEmail: any;
  FormComponentTextarea: any;
  FormComponentCheckbox: any;
  FormComponentCheckboxGroup: any;
  FormComponentRadioGroup: any;
  FormComponentSelect: any;
  FormComponentSelectMultiple: any;
  FormComponentDateTime: any;
  FormComponentDate: any;
  FormComponentDate2: any;
  FormComponentTime: any;
  FormComponentStaticText: any;
  FormComponentLikert: any;
  FormComponentAutocomplete: any;
  FormComponentMultiAutocomplete: any;
  //
  FormComponent: any;
  FormComponentLoader: any;
  FormElement: any;
  FormGroup: any;
  // intl
  FormIntlLayout: any;
  FormIntlItemLayout: any;
  FormIntl: any;
  // Layout
  FormErrors: any;
  FormSubmit: any;
  FormLayout: any;

  // arrays and objects
  FormNestedArrayInnerLayout: any;
  FormNestedArrayLayout: any;
  FormNestedItem: any;
  IconAdd: any;
  IconRemove: any;
  FieldErrors: any;
  FieldNestedDivider: any;
  //
  FormNestedItemLayout: any;
  FormNestedObjectLayout: any;
  FormNestedObject: any;
  FormOptionLabel: any;
}

export const FormComponentsContext = React.createContext<PossibleFormComponents>(
  {
    FormError: () => null, // used by: FieldErrors
    // To be defined by the UI framework
    FormComponentDefault: () => null,
    FormComponentPassword: () => null,
    FormComponentNumber: () => null,
    FormComponentUrl: () => null,
    FormComponentEmail: () => null,
    FormComponentTextarea: () => null,
    FormComponentCheckbox: () => null,
    FormComponentCheckboxGroup: () => null,
    FormComponentRadioGroup: () => null,
    FormComponentSelect: () => null,
    FormComponentSelectMultiple: () => null,
    FormComponentDateTime: () => null,
    FormComponentDate: () => null,
    FormComponentDate2: () => null,
    FormComponentTime: () => null,
    FormComponentStaticText: () => null,
    FormComponentLikert: () => null,
    FormComponentAutocomplete: () => null,
    FormComponentMultiAutocomplete: () => null,
    // Components defined in default vulcan/forms
    FormComponent: () => null,
    FormComponentLoader: () => null,
    FormElement: () => null,
    FormGroup: () => null,
    FormIntl: () => null,
    FormIntlItemLayout: () => null,
    FormIntlLayout: () => null,

    // Layout
    FieldErrors: () => null,
    FormErrors: () => null,
    FormSubmit: () => null,
    FormLayout: () => null,

    FormNestedArrayInnerLayout: () => null,
    FormNestedArrayLayout: () => null,
    FormNestedItem: () => null,
    IconAdd: () => null,
    IconRemove: () => null,
    FieldNestedDivider: () => null,
    // nested item
    FormNestedItemLayout: () => null,
    FormNestedObjectLayout: () => null,
    FormNestedObject: () => null,
    FormOptionLabel: () => null,
  }
);

// TODO: we might need to adapt the provider to merge its value with a potentially higher up context
// So that you can override only some components by adding an additional context while keeping the defaults
export const FormComponentsProvider = FormComponentsContext.Provider;
export const FormsComponentsConsumer = FormComponentsContext.Consumer;

export const useFormComponents = () => useContext(FormComponentsContext);

export const withFormComponents = (C) => (props) => {
  const formComponents = useFormComponents();
  deprecate(
    "0.0.0",
    "Using withFormComponents HOC => prefer useFormComponents with hooks"
  );
  return <C FormComponents={formComponents} {...props} />;
};
