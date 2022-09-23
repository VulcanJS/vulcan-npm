import { FormInputProps, useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";
import { FormControl } from "react-bootstrap";

export const FormComponentEmail = ({
  path,
  label,
  refFunction,
  inputProperties,
  itemProperties,
  name,
}: FormInputProps) => {
  const Components = useVulcanComponents();
  return (
    // passing the name is important to get the right label
    <Components.FormItem
      path={path}
      label={label}
      name={name}
      {...itemProperties}
    >
      {/** @ts-ignore the "as" prop is problematic */}
      <FormControl
        name={name}
        id={name}
        {...inputProperties}
        ref={refFunction}
        type="email"
      />
    </Components.FormItem>
  );
};
