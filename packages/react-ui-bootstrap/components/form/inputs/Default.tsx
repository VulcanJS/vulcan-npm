import { FormInputProps, useVulcanComponents } from '@vulcanjs/react-ui';
import React from 'react';
import { FormControl } from 'react-bootstrap';

export const FormComponentDefault = ({ path, label, refFunction, inputProperties = {}, itemProperties = {} }: FormInputProps) => {
  const Components = useVulcanComponents()
  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      {/** @ts-ignore the "as" prop is problematic */}
      <FormControl {...inputProperties} ref={refFunction} type="text" />
    </Components.FormItem>
  );
};

// registerComponent('FormComponentDefault', Default);
// registerComponent('FormComponentText', Default);
