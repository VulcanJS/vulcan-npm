import { FormattedMessage } from "@vulcanjs/i18n";
import { FormError } from "../../form/FormError";
// TODO: currently we need the default export because we pass components manually
import FormComponent from "../../form/FormComponent";
import { FormComponentInner } from "../../form/FormComponentInner";
import { FormComponentLoader } from "../../form/FormComponentLoader";
import { FormElement } from "../../form/FormElement";
import { FormGroup, FormGroupLayout, FormGroupHeader } from "../../form/FormGroup";
import { FormIntl, FormIntlItemLayout, FormIntlLayout } from "../../form/FormIntl";
import { FormErrors } from "../../form/FormErrors";
import { FormSubmit } from "../../form/FormSubmit";
import { FormLayout } from "../../form/FormLayout";
import {
  FormNestedArray,
  FormNestedArrayInnerLayout,
  IconAdd,
  IconRemove,
} from "../../form/FormNestedArray";
import { FormNestedArrayLayout } from "../../form/FormNestedArrayLayout";
import { FormNestedItem, FormNestedItemLayout } from "../../form/FormNestedItem";
import { FormNestedDivider } from "../../form/FormNestedDivider";
import { FieldErrors } from "../../form/FieldErrors";
import {
  FormNestedObject,
  FormNestedObjectLayout,
} from "../../form/FormNestedObject";
import { FormOptionLabel } from "../../form/FormOptionLabel";
import { Form } from "../../form/Form";

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
  // used by ui-bootstrap and ui-material
  FormItem,
  FormComponentAutocomplete,
} from "../../form/inputs/BasicInputs";
import { AutocompleteMultiple } from "../../form/inputs/AutocompleteMultiple";
import { Button } from "../../form/core/Button";
import { Loading } from "../../form/core/Loading";

import { LoadingButton } from "../../LoadingButton";
import { MutationButton } from "../../MutationButton";
import { HeadTags } from "../../HeadTags";

// TODO: rewrite to remove dep to react-bootstrap
import { TooltipTrigger } from "../../bootstrap/TooltipTrigger";
import Dropdown from "../../bootstrap/Dropdown";

import { PossibleCoreComponents, PossibleFormComponents } from "../typings";
import { defaultCellComponents } from "./cellComponents";
import { defaultDatatableComponents } from "./datatableComponents";
import { BootstrapModal } from "../../bootstrap/Modal";
import { ModalTrigger } from "../../bootstrap/ModalTrigger";
import { FormContainer } from "../../form";

const defaultCoreComponents: PossibleCoreComponents = {
  // core components taht were used in forms
  Loading,
  Alert: () => null,
  Button,
  Icon: () => null,
  // i18n
  FormattedMessage,
  // core
  LoadingButton,
  MutationButton,
  HeadTags,
  //
  TooltipTrigger,
  Dropdown,
  Modal: BootstrapModal,
  ModalTrigger
};
const defaultFormComponents: PossibleFormComponents = {
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
  FormComponentMultiAutocomplete: AutocompleteMultiple,
};

export const defaultVulcanComponents = {
  ...defaultDatatableComponents
  ...defaultCellComponents,
  ...defaultCoreComponents,
  ...defaultFormComponents,
};
