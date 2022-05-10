import React from 'react';
import { FormControl } from 'react-bootstrap';
import { FormInputProps, useVulcanComponents } from '@vulcanjs/react-ui';

export const FormComponentPassword = ({ path, label, refFunction, inputProperties, itemProperties }: FormInputProps) => {
  const Components = useVulcanComponents()
  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      {/** @ts-ignore */}
      <FormControl
        {...inputProperties} ref={refFunction} type="password" />
    </Components.FormItem>
  );
};
