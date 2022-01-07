import React from "react";
import { FormInputProps } from "../FormComponentInner";
import { useVulcanComponents } from "../../VulcanComponents/Consumer";

/**
 * Converts props passed by Vulcan to an HTML Input
 * @see packages/vulcan-ui-bootstrap/lib/components/forms/FormItem.jsx in Vulcan
 * @param param0
 * @returns
 */
const HTMLInputAdapter = (props: FormInputProps & { type: string }) => {
  const Components = useVulcanComponents();
  const { inputProperties } = props;
  const { label, name, ...otherInputProperties } = inputProperties;

  return (
    <Components.FormItem>
      <label htmlFor={name}>{label}</label>
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
    <div>
      <label htmlFor={name}>{label}</label>
      {props.children}
    </div>
  );
};

const HTMLSelectAdapter = (props: FormInputProps) => {
  const { inputProperties, options = [] } = props;
  const { label, name } = inputProperties;
  if (!Array.isArray(options))
    throw new Error("HTMLSelectAdapater not yet supporting functional options");
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      {/** TODO: whitelisting feature should be smarter to differentiate select and input */}
      <select
        {...(inputProperties as unknown as React.HTMLProps<HTMLSelectElement>)}
      >
        {options.map(({ label, value }) => (
          <option key={value} label={label} value={value}></option>
        ))}
      </select>
    </div>
  );
};
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
