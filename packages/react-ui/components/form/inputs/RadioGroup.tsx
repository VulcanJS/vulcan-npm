import React from "react";
import { FormInputProps } from "../FormComponentInner";
import { useVulcanComponents } from "../../VulcanComponents/Consumer";
/**
 *
 * @param props
 * @returns
 */
export const FormComponentRadioGroup = (props: FormInputProps) => {
  const { path, inputProperties, options = [], itemProperties } = props;
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
              value={value}
              {...inputProperties}
            />
          </div>
        );
      })}
    </Components.FormItem>
  );
};
