import React from "react";
import { useVulcanComponents } from "./VulcanComponentsContext";

export interface FormLayoutProps {
  commonProps: any;
  formProps: any;
  errorProps: any;
  submitProps: any;
  repeatErrors?: boolean;
}
export const FormLayout: React.FC<FormLayoutProps> = ({
  commonProps,
  formProps,
  errorProps,
  repeatErrors,
  submitProps,
  children,
}) => {
  const VulcanComponents = useVulcanComponents();
  return (
    <VulcanComponents.FormElement {...formProps}>
      <VulcanComponents.FormErrors {...commonProps} {...errorProps} />

      {children}

      {repeatErrors && (
        <VulcanComponents.FormErrors {...commonProps} {...errorProps} />
      )}

      <VulcanComponents.FormSubmit {...commonProps} {...submitProps} />
    </VulcanComponents.FormElement>
  );
};

export const formComponentsDependencies = [
  "FormErrors",
  "FormSubmit",
  "FormElement",
];
