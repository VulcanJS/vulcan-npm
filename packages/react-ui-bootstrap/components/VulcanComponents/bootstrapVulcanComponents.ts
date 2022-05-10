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

import { bootstrapCoreComponents } from "./bootstrapCoreComponents";
import { bootstrapFormComponents } from "./bootstrapFormComponents";

/**
 * @deprecated Instead load each kind of component as you need them
 */
export const bootstrapVulcanComponents: any = {
  ...bootstrapCoreComponents,
  ...bootstrapFormComponents,
};
