import React from "react";

export interface PossibleCoreComponents {
  Loading: any;
  FormattedMessage: any;
  Alert: any;
  Button: any;
  Icon: any;
  // TODO: define props more precisely
  MutationButton: React.ComponentType<any>;
  LoadingButton: React.ComponentType<any>;
  HeadTags: React.ComponentType<any>;
  // Previously from Bootstrap and Mui
  TooltipTrigger: React.ComponentType<any>;
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
  // FormComponentDate2: any;
  FormComponentTime: any;
  FormComponentStaticText: any;
  FormComponentLikert: any;
  FormComponentAutocomplete: any;
  FormComponentMultiAutocomplete: any;
  //
  FormComponent: any;
  FormComponentInner: any;
  FormComponentLoader: any;
  FormElement: any;
  FormGroup: any;
  FormGroupLayout: any;
  FormGroupHeader: any;
  // intl
  FormIntlLayout: any;
  FormIntlItemLayout: any;
  FormIntl: any;
  // Layout
  FormErrors: any;
  FormSubmit: any;
  FormLayout: any;

  // arrays and objects
  FormNestedArray: any;
  FormNestedArrayInnerLayout: any;
  FormNestedArrayLayout: any;
  FormNestedItem: any;
  IconAdd: any;
  IconRemove: any;
  FieldErrors: any;
  FormNestedDivider: any;
  //
  FormNestedItemLayout: any;
  FormNestedObjectLayout: any;
  FormNestedObject: any;
  FormOptionLabel: any;
  // Form
  Form: any;
  // Used by ui-boostrap and ui-material
  FormItem;
}
export type PossibleVulcanComponents = PossibleCoreComponents &
  PossibleFormComponents;
