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
  const { inputProperties = {}, itemProperties = {}, path } = props;
  const { label, name, ...otherInputProperties } = inputProperties;

  return (
    <Components.FormItem
      name={name}
      path={path}
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
// TODO: at the moment we use a select instead
export const FormComponentCheckbox = (props: FormInputProps) => {
  return <HTMLInputAdapter type="checkbox" {...props} />;
  //<HTMLSelectAdapter type="checkbox" {...props} />
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
export const FormComponentStaticText = (props: FormInputProps) => {
  const { inputProperties } = props;
  return <input {...inputProperties} disabled />;
};
export const FormComponentLikert = (props) =>
  "Likert component not yet implemented";
export const FormComponentAutocomplete = (props) =>
  "Autocomplete component not yet implemented";
//export const FormComponentMultiAutocomplete = (props) =>
//  "MultiAutocomplete component not yet implemented";

export const FormComponentTextarea = (props: FormTextAreaProps) => {
  const Components = useVulcanComponents();
  const { inputProperties = {}, itemProperties = {}, path } = props;
  const { label, name, ...otherInputProperties } = inputProperties;
  return (
    <Components.FormItem
      name={name}
      path={path}
      label={label}
      inputProperties={inputProperties}
      {...itemProperties}
    >
      <label htmlFor="name">{label}</label>
      <textarea {...inputProperties} />
    </Components.FormItem>
  );
};
