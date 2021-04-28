import React, { PureComponent, useState } from "react";
import PropTypes from "prop-types";
import _some from "lodash/some";
import { User, isAdmin } from "@vulcanjs/permissions";
import { FieldGroup } from "@vulcanjs/schema";
import { FormField } from "./typings";
import {
  useVulcanComponents,
  VulcanComponentsContext,
} from "./VulcanComponentsContext";

export interface FormGroupProps {
  name: string;
  label: string;
  // TODO: check if already defined or create a typings.ts to share this component
  // NOTE: make distinction between the group definition, and the extended version of Form
  group: FieldGroup /*{
    adminsOnly?: boolean;
    beforeComponent?: any;
  };*/;
  fields: Array<FormField>;
  errors: Array<any>;
  hidden?: boolean | Function;
  disabled?: boolean;
  document: any;
  currentUser?: User;
  itemProperties: any;
  // TODO: get those from Form context instead
  throwError: any;
  currentValues: any;
  updateCurrentValues: any;
  deletedValues: any;
  addToDeletedValues: any;
  clearFieldErrors: any;
  formType: any;
  prefilledProps: any;
  submitForm: any;
}
interface FormGroupState {
  collapsed: boolean;
}

export const FormGroupLayout = (props) => <fieldset {...props} />;
export const FormGroupHeader = (props) => <h2 {...props} />;
export const FormGroup /*<FormGroupProps, FormGroupState>*/ = (
  props: FormGroupProps
) => {
  // TODO: get value/update methods from context instead
  const {
    name,
    label,
    group,
    fields,
    errors,
    hidden,
    document,
    currentUser,
    disabled,
    itemProperties,
    prefilledProps,
    throwError,
    formType,
    updateCurrentValues,
    clearFieldErrors,
    submitForm,
    currentValues,
    deletedValues,
    addToDeletedValues,
  } = props;
  const [collapsed, setCollapsed] = useState<boolean>(
    group.startCollapsed || false
  );
  const toggle = () => setCollapsed((collapsed) => !collapsed);
  // if at least one of the fields in the group has an error, the group as a whole has an error
  const hasErrors = _some(fields, (field) => {
    return !!errors.filter((error) => error.path === field.path).length;
  });
  const VulcanComponents = useVulcanComponents();

  const isHidden =
    typeof hidden === "function"
      ? hidden({ ...props, document })
      : hidden || false;
  /*
  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    order: PropTypes.number,
    hidden: PropTypes.func,
    fields: PropTypes.array.isRequired,
    group: PropTypes.object.isRequired,
    errors: PropTypes.array.isRequired,
    throwError: PropTypes.func.isRequired,
    currentValues: PropTypes.object.isRequired,
    updateCurrentValues: PropTypes.func.isRequired,
    deletedValues: PropTypes.array.isRequired,
    addToDeletedValues: PropTypes.func.isRequired,
    clearFieldErrors: PropTypes.func.isRequired,
    formType: PropTypes.string.isRequired,
    currentUser: PropTypes.object,
    prefilledProps: PropTypes.object,
  };*/

  const heading = (
    <VulcanComponents.FormGroupHeader
      toggle={toggle}
      label={label}
      collapsed={collapsed}
      hidden={isHidden}
      group={group}
    />
  );

  if (group.adminsOnly && !isAdmin(currentUser)) {
    return null;
  }
  const anchorName = name.split(".").length > 1 ? name.split(".")[1] : name;

  return (
    <VulcanComponents.FormGroupLayout
      label={label}
      anchorName={anchorName}
      toggle={toggle}
      collapsed={collapsed}
      hidden={isHidden}
      group={group}
      heading={name === "default" ? null : heading}
      hasErrors={hasErrors}
      document={document}
    >
      {/* TODO: create TS error at the moment: group.beforeComponent && <group.beforeComponent {...props} />*/}

      {fields.map((field) => (
        <VulcanComponents.FormComponent
          key={field.name}
          disabled={disabled}
          {...field}
          document={document}
          itemProperties={{
            ...itemProperties,
            ...field.itemProperties,
          }}
          errors={errors}
          throwError={throwError}
          currentValues={currentValues}
          updateCurrentValues={updateCurrentValues}
          deletedValues={deletedValues}
          addToDeletedValues={addToDeletedValues}
          clearFieldErrors={clearFieldErrors}
          formType={formType}
          currentUser={currentUser}
          prefilledProps={prefilledProps}
          submitForm={submitForm}
        />
      ))}

      {/* TODO: create TS error at the moment: group.afterComponent && <group.afterComponent {...props} />*/}
    </VulcanComponents.FormGroupLayout>
  );
};

export default FormGroup;
