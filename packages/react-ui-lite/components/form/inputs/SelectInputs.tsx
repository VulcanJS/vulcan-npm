import React from "react";
import type { FormInputProps } from "../typings";
import { useVulcanComponents } from "@vulcanjs/react-ui";

const HTMLSelectAdapter = (props: FormInputProps<HTMLSelectElement>) => {
  const {
    multiple,
    path,
    inputProperties = {},
    options = [],
    itemProperties,
  } = props;
  const { label, name } = inputProperties;
  if (!Array.isArray(options))
    throw new Error("HTMLSelectAdapater not yet supporting functional options");

  const Components = useVulcanComponents();
  return (
    <Components.FormItem
      name={name}
      label={label}
      path={path}
      inputProperties={inputProperties}
      {...itemProperties}
    >
      {/** TODO: whitelisting feature should be smarter to differentiate select and input */}
      <select
        multiple={multiple}
        {...inputProperties}
        value={
          inputProperties.value === null ? undefined : inputProperties.value
        }
      >
        {options.map(({ label, value }) => (
          <option key={value} label={label} value={value}></option>
        ))}
      </select>
    </Components.FormItem>
  );
};

export const FormComponentSelect = (
  props: FormInputProps<HTMLSelectElement>
) => <HTMLSelectAdapter {...props} />;

export const FormComponentSelectMultiple = (props) => {
  const Components = useVulcanComponents();
  return <Components.FormComponentSelect multiple {...props} />;
};
