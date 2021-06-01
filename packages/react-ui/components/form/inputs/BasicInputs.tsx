import React from "react";
import { FormInputProps } from "../FormComponentInner";
import { useVulcanComponents } from "../VulcanComponentsContext";

/**
 * Converts props passed by Vulcan to an HTML Input
 * @see packages/vulcan-ui-bootstrap/lib/components/forms/FormItem.jsx in Vulcan
 * @param param0
 * @returns
 */
const HTMLInputAdapter = (props: FormInputProps & { type: string }) => {
  const { inputProperties } = props;
  const { label, name } = inputProperties;

  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input {...props.inputProperties} type={props.type} />
    </div>
  );
}; // TODO: might need some sanitization
export const FormComponentDefault = (props) => (
  <HTMLInputAdapter type="text" {...props} />
);
export const FormComponentPassword = (props) => (
  <HTMLInputAdapter type="password" {...props} />
);
export const FormComponentNumber = (props) => (
  <HTMLInputAdapter type="number" {...props} />
);
export const FormComponentUrl = (props) => (
  <HTMLInputAdapter type="url" {...props} />
);
export const FormComponentEmail = (props) => (
  <HTMLInputAdapter type="email" {...props} />
);
export const FormComponentTextarea = (props) => <textarea {...props} />;
export const FormComponentCheckbox = (props) => (
  <HTMLInputAdapter type="checkbox" {...props} />
);
// TODO
export const FormComponentCheckboxGroup = (props) => (
  <HTMLInputAdapter {...props} />
);
// TODO
export const FormComponentRadioGroup = (props) => (
  <HTMLInputAdapter {...props} />
);
export const FormComponentSelect = ({ options, ...props }) => (
  <select {...props}>
    {options.map(({ label, value }) => (
      <option key={value} label={label} value={value}></option>
    ))}
  </select>
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
export const FormComponentMultiAutocomplete = (props) =>
  "MultiAutocomplete component not yet implemented";
