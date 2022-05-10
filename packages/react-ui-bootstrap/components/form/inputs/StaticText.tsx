import React from 'react';
import { FormInputProps, useVulcanComponents } from '@vulcanjs/react-ui';

const parseUrl = value => {
  return value && value.toString().slice(0, 4) === 'http' ? (
    <a href={value} target="_blank" rel="noopener noreferrer">
      {value}
    </a>
  ) : (
    value
  );
};

export const FormComponentStaticText = ({ path, label, inputProperties, itemProperties }: FormInputProps) => {
  const Components = useVulcanComponents()
  return (
    <Components.FormItem path={path} label={label} {...itemProperties}>
      <div style={{ paddingTop: 'calc(.375rem + 1px)', paddingBottom: 'calc(.375rem + 1px)' }}>{parseUrl(inputProperties.value)}</div>
    </Components.FormItem>
  )
};

