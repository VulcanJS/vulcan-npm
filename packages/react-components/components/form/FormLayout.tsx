import React from "react";
import { useFormComponents } from "./FormComponentsContext";

export const FormLayout = ({
  commonProps,
  formProps,
  errorProps,
  repeatErrors,
  submitProps,
  children,
}) => {
  const FormComponents = useFormComponents();
  return (
    <FormComponents.FormElement {...formProps}>
      <FormComponents.FormErrors {...commonProps} {...errorProps} />

      {children}

      {repeatErrors && (
        <FormComponents.FormErrors {...commonProps} {...errorProps} />
      )}

      <FormComponents.FormSubmit {...commonProps} {...submitProps} />
    </FormComponents.FormElement>
  );
};

export const formComponentsDependencies = [
  "FormErrors",
  "FormSubmit",
  "FormElement",
];
