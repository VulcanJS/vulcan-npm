import React from "react";
import { FormInputProps, FormTextAreaProps } from "../FormComponentInner";
import { useVulcanComponents } from "../../VulcanComponents/Consumer";

/**
 * Converts props passed by Vulcan to an HTML Input
 * @see packages/vulcan-ui-bootstrap/lib/components/forms/FormItem.jsx in Vulcan
 * @param param0
 * @returns
 */
const HTMLInputAdapter = (props: FormInputProps & { type: string }) => {
  const Components = useVulcanComponents();
  const { inputProperties, itemProperties } = props;
  const { label, name, ...otherInputProperties } = inputProperties;

  return (
    <Components.FormItem
      name={name}
      label={label}
      inputProperties={inputProperties}
      {...itemProperties}
    >
      {/* @ts-ignore FIXME: leads to "Types of property 'capture' are incompatible" when trying to build the types... */}
      <input
        {...otherInputProperties}
        id={name} // needed for accessibility. NOTE: we might need to use "context" as a prefix when having
        // multiple forms for the same kind of data
        name={name}
        type={props.type}
      />
    </Components.FormItem>
  );
}; // TODO: might need some sanitization
// For consistency with Vulcan Meteor ui bootstrap and ui material
// @see packages/vulcan-ui-bootstrap/lib/components/forms/FormItem.jsx
export const FormItem = (
  props: FormInputProps["itemProperties"] &
    Pick<FormInputProps["inputProperties"], "label" | "name">
) => {
  const { inputProperties, label, name } = props;
  return (
    <div className={`form-item ${name}`}>
      <label htmlFor={name}>{label}</label>
      {props.children}
    </div>
  );
};

const HTMLSelectAdapter = (props: FormInputProps) => {
  const { inputProperties, options = [], itemProperties } = props;
  const { label, name } = inputProperties;
  if (!Array.isArray(options))
    throw new Error("HTMLSelectAdapater not yet supporting functional options");

  const Components = useVulcanComponents();
  return (
    <Components.FormItem
      name={name}
      label={label}
      inputProperties={inputProperties}
      {...itemProperties}
    >
      {/** TODO: whitelisting feature should be smarter to differentiate select and input */}
      <select
        {...(inputProperties as unknown as React.HTMLProps<HTMLSelectElement>)}
      >
        {options.map(({ label, value }) => (
          <option key={value} label={label} value={value}></option>
        ))}
      </select>
    </Components.FormItem>
  );
};
export const FormComponentDefault = (props: FormInputProps) => (
  <HTMLInputAdapter type="text" {...props} />
);
export const FormComponentPassword = (props: FormInputProps) => (
  <HTMLInputAdapter type="password" {...props} />
);
export const FormComponentNumber = (props: FormInputProps) => (
  <HTMLInputAdapter type="number" {...props} />
);
export const FormComponentUrl = (props: FormInputProps) => (
  <HTMLInputAdapter type="url" {...props} />
);
export const FormComponentEmail = (props: FormInputProps) => (
  <HTMLInputAdapter type="email" {...props} />
);
export const FormComponentTextarea = (props: FormTextAreaProps) => {
  const { inputProperties, itemProperties } = props;
  return <textarea {...inputProperties} />;
};
// TODO: at the moment we use a select instead
export const FormComponentCheckbox = (props: FormInputProps) => (
  <HTMLSelectAdapter type="checkbox" {...props} />
);
// TODO: atm we use a select multiple instead of checkboxes
export const FormComponentCheckboxGroup = (props: FormInputProps) => (
  <FormComponentSelectMultiple {...props} />
);

/**
 *
 * @param props
 * @returns
 */
export const FormComponentRadioGroup = (props: FormInputProps) => {
  const { inputProperties, options = [], itemProperties } = props;
  const { label, name } = inputProperties;
  if (!Array.isArray(options))
    throw new Error("RadioGroup not yet supporting functional options");

  const Components = useVulcanComponents();
  return (
    <Components.FormItem
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
            />
          </div>
        );
      })}
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
export const FormComponentDate = (props) => (
  <HTMLInputAdapter type="date" {...props} />
);
/*
export const FormComponentDate2 = (props) => (
  <HTMLInputAdapter {...props} />
);
*/
export const FormComponentDateTime = (props) => (
  <HTMLInputAdapter type="datetime-local" {...props} />
);
export const FormComponentTime = (props) => (
  <HTMLInputAdapter type="time" {...props} />
);
export const FormComponentStaticText = (props) => <input disabled {...props} />;
export const FormComponentLikert = (props) =>
  "Likert component not yet implemented";
export const FormComponentAutocomplete = (props) =>
  "Autocomplete component not yet implemented";
//export const FormComponentMultiAutocomplete = (props) =>
//  "MultiAutocomplete component not yet implemented";
