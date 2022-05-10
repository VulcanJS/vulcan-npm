import React from "react";
import { FormInputProps } from "../typings";

import { useVulcanComponents } from "@vulcanjs/react-ui";
/**
 *
 * @param props
 * @returns
 */
export const FormComponentRadioGroup = (props: FormInputProps) => {
  const {
    value: propsValue,
    path,
    inputProperties,
    options = [],
    itemProperties,
  } = props;
  // NOTE: inputProperties.value is undefined
  // use "props.value" instead
  const { label, name } = inputProperties;
  if (!Array.isArray(options))
    throw new Error("RadioGroup not yet supporting functional options");

  const Components = useVulcanComponents();
  return (
    <Components.FormItem
      path={path}
      name={name}
      label={label}
      inputProperties={inputProperties}
      {...itemProperties}
    >
      {/** TODO: whitelisting feature should be smarter to differentiate select and input */}
      {options.map((option) => {
        // NOTE: option can also have custom values, used by the FormOptionLabel component
        const { value, label } = option;
        return (
          <div key={value} className="form-radio-group-radio-item">
            <Components.FormOptionLabel option={option} />
            <input
              type="radio"
              id={value}
              name={name}
              key={value}
              {...inputProperties}
              value={value}
              checked={value === propsValue}
            />
          </div>
        );
      })}
    </Components.FormItem>
  );
};
