import { useVulcanComponents } from "../VulcanComponentsContext";

const Input = ({ props }) => <input {...props} />; // TODO: might need some sanitization
export const FormComponentDefault = (props) => <input type="text" {...props} />;
export const FormComponentPassword = (props) => (
  <Input type="password" {...props} />
);
export const FormComponentNumber = (props) => (
  <Input type="number" {...props} />
);
export const FormComponentUrl = (props) => <Input type="url" {...props} />;
export const FormComponentEmail = (props) => <Input {...props} />;
export const FormComponentTextarea = (props) => <textarea {...props} />;
export const FormComponentCheckbox = (props) => (
  <Input type="checkbox" {...props} />
);
// TODO
export const FormComponentCheckboxGroup = (props) => <Input {...props} />;
// TODO
export const FormComponentRadioGroup = (props) => <Input {...props} />;
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
export const FormComponentDate = (props) => <Input type="date" {...props} />;
/*
export const FormComponentDate2 = (props) => (
  <Input {...props} />
);
*/
export const FormComponentDateTime = (props) => (
  <Input type="datetime-local" {...props} />
);
export const FormComponentTime = (props) => <Input type="time" {...props} />;
export const FormComponentStaticText = (props) => <input disabled {...props} />;
export const FormComponentLikert = (props) =>
  "Likert component not yet implemented";
export const FormComponentAutocomplete = (props) =>
  "Autocomplete component not yet implemented";
export const FormComponentMultiAutocomplete = (props) =>
  "MultiAutocomplete component not yet implemented";
