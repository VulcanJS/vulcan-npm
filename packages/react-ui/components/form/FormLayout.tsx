import React from "react";
import { useVulcanComponents } from "../VulcanComponents/Consumer";

export interface FormLayoutProps {
  commonProps: any;
  formProps: any;
  submitProps: any;
  repeatErrors?: boolean;
}
export const FormLayout: React.FC<FormLayoutProps> = ({
  commonProps,
  formProps,
  repeatErrors,
  submitProps,
  children,
}) => {
  const VulcanComponents = useVulcanComponents();
  return (
    <VulcanComponents.FormElement {...formProps}>
      <VulcanComponents.FormErrors {...commonProps} />

      {children}

      {repeatErrors && <VulcanComponents.FormErrors {...commonProps} />}

      <VulcanComponents.FormSubmit {...commonProps} {...submitProps} />
    </VulcanComponents.FormElement>
  );
};

export const formComponentsDependencies = [
  "FormErrors",
  "FormSubmit",
  "FormElement",
];
