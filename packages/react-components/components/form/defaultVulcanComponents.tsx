export interface PossibleCoreComponents {
  Loading: any;
  FormattedMessage: any;
  Alert: any;
  Button: any;
  Icon: any;
}
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
  // Form
  Form: any;
}
export type PossibleVulcanComponents = PossibleCoreComponents &
  PossibleFormComponents;

const defaultCoreComponents: PossibleCoreComponents = {
  Loading: () => null,
  FormattedMessage: () => null,
  Alert: () => null,
  Button: () => null,
  Icon: () => null,
};
const defaultFormComponents: PossibleFormComponents = {
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
  //
  Form: () => null,
};

export const defaultVulcanComponents = {
  ...defaultCoreComponents,
  ...defaultFormComponents,
};
