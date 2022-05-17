import { FormInputProps, useVulcanComponents } from "@vulcanjs/react-ui";
import React from "react";
import { FormControl } from "react-bootstrap";

export const FormComponentTextarea = ({
  path,
  label,
  refFunction,
  inputProperties = {},
  itemProperties = {},
}: FormInputProps) => {
  const Components = useVulcanComponents();
  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      <FormControl
        // @ts-expect-error
        as="textarea"
        ref={refFunction}
        {...inputProperties}
      />
    </Components.FormItem>
  );
};
