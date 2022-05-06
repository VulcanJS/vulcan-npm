import React from "react";
import type { FormOption } from "../core/FormComponent";

export interface FormOptionLabelProps
  extends React.HTMLProps<HTMLLabelElement> {
  option: FormOption;
}
export const FormOptionLabel = ({ option, name }: FormOptionLabelProps) => {
  const { label } = option;
  // NOTE: for radio groups we might need to wrap this with a label? And maybe even for select?
  return (
    <label htmlFor={name} className="form-option-label">
      {label}
    </label>
  );
};
