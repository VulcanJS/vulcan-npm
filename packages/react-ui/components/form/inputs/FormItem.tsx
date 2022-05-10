import React from "react";
import { FormInputProps } from "../typings";


// TODO: might need some sanitization
// For consistency with Vulcan Meteor ui bootstrap and ui material
// @see packages/vulcan-ui-bootstrap/lib/components/forms/FormItem.jsx
export const FormItem = (
  props: FormInputProps["itemProperties"] &
    Pick<FormInputProps["inputProperties"], "label" | "name">
) => {
  const { inputProperties, label, name } = props;
  return (
    <div className={`form-item ${name}`}>
      <label htmlFor={name}>{label}</label>
      {props.children}
    </div>
  );
};
