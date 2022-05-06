import React from "react";
import { FormInputProps, FormTextAreaProps } from "../FormComponentInner";
import { useVulcanComponents } from "../../VulcanComponents/Consumer";

const HTMLSelectAdapter = (props: FormInputProps) => {
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
        {...(inputProperties as unknown as React.HTMLProps<HTMLSelectElement>)}
      >
        {options.map(({ label, value }) => (
          <option key={value} label={label} value={value}></option>
        ))}
      </select>
    </Components.FormItem>
  );
};

export const FormComponentSelect = (props: FormInputProps) => (
  <HTMLSelectAdapter {...props} />
);

export const FormComponentSelectMultiple = (props) => {
  const Components = useVulcanComponents();
  return <Components.FormComponentSelect multiple {...props} />;
};
