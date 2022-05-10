import { useIntlContext } from '@vulcanjs/react-i18n';
import { useVulcanComponents } from '@vulcanjs/react-ui';
import React from 'react';
import { FormControl } from 'react-bootstrap';

// copied from vulcan:forms/utils.js to avoid extra dependency
const getFieldType = datatype => datatype && datatype[0].type;

export const FormComponentSelect = ({ refFunction, inputProperties, itemProperties, datatype, options }) => {
  const Components = useVulcanComponents()
  const intl = useIntlContext()
  const noneOption = {
    label: intl.formatMessage({ id: 'forms.select_option' }),
    value: getFieldType(datatype) === String || getFieldType(datatype) === Number ? '' : null, // depending on field type, empty value can be '' or null
    disabled: true,
  };
  let otherOptions = Array.isArray(options) && options.length ? options : [];
  const allOptions = [noneOption, ...otherOptions];
  const { options: deleteOptions, ...newInputProperties } = inputProperties;
  return (
    <Components.FormItem path={inputProperties.path} label={inputProperties.label} {...itemProperties}>
      <FormControl as="select" {...newInputProperties} ref={refFunction}>
        {allOptions.map(({ value, label, intlId, ...rest }) => (
          <option key={value} value={value} {...rest}>
            {label}
          </option>
        ))}
      </FormControl>
    </Components.FormItem>
  );
};
