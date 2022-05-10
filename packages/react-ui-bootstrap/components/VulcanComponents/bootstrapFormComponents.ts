import type { PossibleFormComponents } from "@vulcanjs/react-ui";
import {
  FormComponentCheckboxGroup,
  FormComponentRadioGroup,
  AutocompleteMultiple,
  FormComponentAutocomplete,
  FormComponentDefault,
  FormComponentEmail,
  FormComponentNumber,
  FormComponentPassword,
  FormComponentSelect,
  FormComponentSelectMultiple,
  FormComponentUrl,
  FormComponentStaticText,
} from "../form/inputs";
import { FormElement, FormDescription } from "../form/elements/index";
import { liteFormComponents } from "@vulcanjs/react-ui-lite";
/*
import {
  FormError,
  FormErrors,
  FormSubmit,
  FormLayout,
  FormElement,
  FieldErrors,
} from "../../form/elements";
// TODO: currently we need the default export because we pass components manually
import {
  FormContainer,
  FormComponent,
  FormComponentInner,
  FormComponentLoader,
} from "../../form/core/index";
import { Form } from "../../form/core/Form";
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
  AutocompleteMultiple,
} from "../../form/inputs";*/

export const bootstrapFormComponents: Partial<PossibleFormComponents> = {
  // TODO: bootstrap is still incomplete so we also mix the more complete lite components
  ...liteFormComponents,
  FormComponentRadioGroup,
  FormComponentCheckboxGroup,
  /*
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
  Form,
  SmartForm: FormContainer,
  //
  FormItem,
  FormComponentAutocomplete,
  */

  FormComponentAutocomplete,
  FormComponentMultiAutocomplete: AutocompleteMultiple,

  FormComponentDefault,
  FormComponentText: FormComponentDefault,
  FormComponentEmail,
  FormComponentNumber,
  FormComponentPassword,
  FormComponentSelect,
  FormComponentSelectMultiple,
  FormComponentUrl,
  FormComponentStaticText,
  FormElement,
};
