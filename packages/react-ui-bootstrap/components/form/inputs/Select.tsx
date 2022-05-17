import { useIntlContext } from "@vulcanjs/react-i18n";
import { FormInputProps, useVulcanComponents } from "@vulcanjs/react-ui";
import type { FormOption } from "@vulcanjs/react-ui";
import React, { ElementType } from "react";
import { FormControl } from "react-bootstrap";

export const FormComponentSelect = ({
  path,
  label,
  refFunction,
  inputProperties,
  itemProperties,
  datatype,
  options,
}: FormInputProps<HTMLSelectElement>) => {
  const Components = useVulcanComponents();
  const intl = useIntlContext();
  const noneOption: FormOption<any> = {
    label: intl.formatMessage({ id: "forms.select_option" }),
    value: datatype === String || datatype === Number ? "" : null, // depending on field type, empty value can be '' or null
    disabled: true,
  };
  let otherOptions = Array.isArray(options) && options.length ? options : [];
  const allOptions = [noneOption, ...otherOptions];
  // @ts-ignore
  const { options: deleteOptions, ...newInputProperties } = inputProperties;
  return (
    <Components.FormItem
      path={path}
      label={inputProperties.label}
      name={inputProperties.name}
      {...itemProperties}
    >
      <FormControl
        // @ts-ignore
        as={"select" as ElementType}
        {...newInputProperties}
        ref={refFunction}
      >
        {allOptions.map(({ value, label, intlId, ...rest }) => (
          <option key={value} value={value} {...rest}>
            {label}
          </option>
        ))}
      </FormControl>
    </Components.FormItem>
  );
};
