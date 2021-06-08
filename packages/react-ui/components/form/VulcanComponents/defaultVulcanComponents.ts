import { FormattedMessage } from "@vulcanjs/i18n";
import { FormError } from "../FormError";
// TODO: currently we need the default export because we pass components manually
import FormComponent from "../FormComponent";
import { FormComponentInner } from "../FormComponentInner";
import { FormComponentLoader } from "../FormComponentLoader";
import { FormElement } from "../FormElement";
import { FormGroup, FormGroupLayout, FormGroupHeader } from "../FormGroup";
import { FormIntl, FormIntlItemLayout, FormIntlLayout } from "../FormIntl";
import { FormErrors } from "../FormErrors";
import { FormSubmit } from "../FormSubmit";
import { FormLayout } from "../FormLayout";
import {
  FormNestedArray,
  FormNestedArrayInnerLayout,
  IconAdd,
  IconRemove,
} from "../FormNestedArray";
import { FormNestedArrayLayout } from "../FormNestedArrayLayout";
import { FormNestedItem, FormNestedItemLayout } from "../FormNestedItem";
import { FormNestedDivider } from "../FormNestedDivider";
import { FieldErrors } from "../FieldErrors";
import { FormNestedObject, FormNestedObjectLayout } from "../FormNestedObject";
import { FormOptionLabel } from "../FormOptionLabel";
import { Form } from "../Form";

import {
  FormComponentDefault,
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
  FormComponentTime,
  FormComponentStaticText,
  FormComponentLikert,
  FormComponentAutocomplete,
  FormComponentMultiAutocomplete,
} from "../inputs/BasicInputs";
import { Button } from "../core/Button";
import { Loading } from "../core/Loading";
import { PossibleCoreComponents, PossibleFormComponents } from "./typings";

const defaultCoreComponents: PossibleCoreComponents = {
  Loading,
  FormattedMessage,
  Alert: () => null,
  Button,
  Icon: () => null,
};
const defaultFormComponents: PossibleFormComponents = {
  FormError, // used by: FieldErrors
  // To be defined by the UI framework
  // TODO: add defaults in React components
  FormComponentDefault,
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
  FormComponentAutocomplete,
  FormComponentMultiAutocomplete,
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
};

export const defaultVulcanComponents = {
  ...defaultCoreComponents,
  ...defaultFormComponents,
};
