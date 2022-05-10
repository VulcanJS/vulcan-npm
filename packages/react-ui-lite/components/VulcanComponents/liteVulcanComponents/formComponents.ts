import {
  defaultFormComponents,
  PossibleFormComponents,
} from "@vulcanjs/react-ui";
import {
  FormError,
  FormErrors,
  FormSubmit,
  FormLayout,
  FormElement,
  FieldErrors,
} from "../../form/elements";
import {
  FormComponent,
  FormComponentInner,
  FormComponentLoader,
} from "../../form/core/index";
import {
  FormGroup,
  FormGroupLayout,
  FormGroupHeader,
} from "../../form/core/FormGroup";
import {
  FormIntl,
  FormIntlItemLayout,
  FormIntlLayout,
} from "../../form/intl/FormIntl";
import {
  FormNestedArray,
  FormNestedArrayInnerLayout,
  IconAdd,
  IconRemove,
  //
  FormNestedDivider,
  //
  FormNestedArrayLayout,
  //
  FormNestedItem,
  FormNestedItemLayout,
  //
  FormNestedObject,
  FormNestedObjectLayout,
} from "../../form/nested";

import {
  FormComponentDefault,
  FormComponentPassword,
  FormComponentNumber,
  FormComponentUrl,
  FormComponentEmail,
  FormComponentCheckbox,
  FormComponentTextarea,
  FormComponentSelect,
  FormComponentSelectMultiple,
  FormComponentDateTime,
  FormComponentDate,
  FormComponentTime,
  FormComponentStaticText,
  FormComponentLikert,
  FormComponentAutocomplete,
  FormComponentCheckboxGroup,
  FormComponentRadioGroup,
  // input utilities
  FormItem,
  FormOptionLabel,
  //
} from "../../form/inputs";

export const liteFormComponents: Partial<PossibleFormComponents> = {
  // Reexpose defaults provided by react-ui
  ...defaultFormComponents,
  // Specific implementations
  FormError, // used by: FieldErrors
  // To be defined by the UI framework
  // TODO: add defaults in React components
  FormComponentDefault,
  FormComponentText: FormComponentDefault,
  FormComponentPassword,
  FormComponentNumber,
  FormComponentUrl,
  FormComponentEmail,
  FormComponentTextarea,
  FormComponentCheckbox,
  FormComponentCheckboxGroup,
  FormComponentRadioGroup,
  FormComponentSelect,
  FormComponentSelectMultiple,
  FormComponentDateTime,
  FormComponentDate,
  //FormComponentDate2,
  FormComponentTime,
  FormComponentStaticText,
  FormComponentLikert,
  //FormComponentAutocomplete,
  //FormComponentMultiAutocomplete,
  // Components defined in default vulcan/forms
  FormComponent,
  FormComponentInner,
  FormComponentLoader,
  FormElement,
  FormGroup,
  FormGroupLayout,
  FormGroupHeader,
  FormIntl,
  FormIntlItemLayout,
  FormIntlLayout,

  // Layout
  FieldErrors,
  FormErrors,
  FormSubmit,
  FormLayout,

  FormNestedArray,
  FormNestedArrayInnerLayout,
  FormNestedArrayLayout,
  FormNestedItem,
  IconAdd,
  IconRemove,
  FormNestedDivider,
  // nested item
  FormNestedItemLayout,
  FormNestedObjectLayout,
  FormNestedObject,
  FormOptionLabel,
  //
  FormItem,
};
