/**
 * NOTE: previously, this package would also register its own components
 *
 * However, we advise against generalizing Vulcan component replacement approach
 * outside of core components (SmartForm, DataTable, Card).
 *
 * This approach induce a lot of complexity, and only make sense for extremely complex,
 * reusable UI components, exactly like the SmartForm.
 *
 * Even then, you should probably investigate reusing hooks and logic, instead of the components
 * themselves.
 *
 * In other scenarios, use good, old import/export.
 */
import { FormattedMessage } from "@vulcanjs/i18n";
// import { FormError } from "../FormError";
// // TODO: currently we need the default export because we pass components manually
// import FormComponent from "../FormComponent";
// import { FormComponentInner } from "../form/FormComponentInner";
// import { FormComponentLoader } from "../FormComponentLoader";
// import { FormElement } from "../FormElement";
// import { FormGroup, FormGroupLayout, FormGroupHeader } from "../FormGroup";
// import { FormIntl, FormIntlItemLayout, FormIntlLayout } from "../FormIntl";
// import { FormErrors } from "../form/FormErrors";
// import { FormSubmit } from "../form/FormSubmit";
//import { FormLayout } from "../FormLayout";
//import {
//  FormNestedArray,
//  FormNestedArrayInnerLayout,
//  IconAdd,
//  IconRemove,
//} from "../FormNestedArray";
//import { FormNestedArrayLayout } from "../form/FormNestedArrayLayout";
//import { FormNestedItem, FormNestedItemLayout } from "../FormNestedItem";
//import { FormNestedDivider } from "../form/FormNestedDivider";
//import { FieldErrors } from "../FieldErrors";
//import { FormNestedObject, FormNestedObjectLayout } from "../FormNestedObject";
//import { FormOptionLabel } from "../FormOptionLabel";
//import { Form } from "../Form";

import {
  FormComponentDefault,
  // FormComponentPassword,
  // FormComponentNumber,
  // FormComponentUrl,
  // FormComponentEmail,
  // FormComponentTextarea,
  // FormComponentCheckbox,
  // FormComponentCheckboxGroup,
  // FormComponentRadioGroup,
  // FormComponentSelect,
  // FormComponentSelectMultiple,
  // FormComponentDateTime,
  // FormComponentDate,
  // FormComponentTime,
  // FormComponentStaticText,
  // FormComponentLikert,
  // FormComponentAutocomplete,
  // FormComponentMultiAutocomplete,
} from "../form/base-controls"; //"../inputs/BasicInputs";
import { Button } from "../core/Button";
import { Loading } from "../core/Loading";

import {
  PossibleCoreComponents,
  PossibleFormComponents,
} from "@vulcanjs/react-ui";

const muiCoreComponents: PossibleCoreComponents = {
  Loading,
  FormattedMessage,
  Alert: () => null,
  Button,
  Icon: () => null,
};
const muiFormComponents: Partial<PossibleFormComponents> = {
  //FormError, // used by: FieldErrors
  // To be defined by the UI framework
  // TODO: add defaults in React components
  FormComponentDefault,
  /*
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
  */
  // //FormComponentDate2,
  /*
  FormComponentTime,
  FormComponentStaticText,
  FormComponentLikert,
  FormComponentAutocomplete,
  FormComponentMultiAutocomplete,
  */
  // Components defined in default vulcan/forms
  /*
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
  */

  // Layout
  /*
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
  */
  // nested item
  /*
  FormNestedItemLayout,
  FormNestedObjectLayout,
  FormNestedObject,
  FormOptionLabel,
  */
  //
  //Form,
};

export const muiVulcanComponents = {
  ...muiCoreComponents,
  ...muiFormComponents,
};
