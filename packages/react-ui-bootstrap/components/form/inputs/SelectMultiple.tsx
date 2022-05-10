import React from 'react';
import { FormControl } from 'react-bootstrap';
import { FormInputProps, useVulcanComponents } from '@vulcanjs/react-ui';
import { useIntlContext } from "@vulcanjs/react-i18n"

export const FormComponentSelectMultiple = ({ path, label, refFunction, inputProperties, itemProperties }: FormInputProps) => {
  inputProperties.multiple = true;
  const Components = useVulcanComponents()
  const intl = useIntlContext()
  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      <FormControl
        // @ts-expect-error
        as="select"
        {...inputProperties} ref={refFunction} />
    </Components.FormItem>
  );
};
