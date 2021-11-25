import React from "react";
// import PropTypes from "prop-types";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
//import { useVulcanComponents } from "@vulcanjs/react-ui";
import RequiredIndicator from "./RequiredIndicator";

export interface FormControlLayoutProps {
  label: any;
  children: any;
  className?: string;
  optional: boolean;
  hasErrors: boolean;
  hideLabel: boolean;
  fakeLabel?: boolean;
  shrinkLabel?: boolean;
  layout: "horizontal" | "vertical" | "elementOnly" | "shrink";
  htmlFor: string;
  inputType: string;
  required: boolean;
  value: any;
}

//noinspection JSUnusedGlobalSymbols
export const FormControlLayout = (props: FormControlLayoutProps) => {
  /*createReactClass({
  propTypes: {
    label: PropTypes.node,
    children: PropTypes.node,
    optional: PropTypes.bool,
    hasErrors: PropTypes.bool,
    fakeLabel: PropTypes.bool,
    hideLabel: PropTypes.bool,
    shrinkLabel: PropTypes.bool,
    layout: PropTypes.oneOf([
      "horizontal",
      "vertical",
      "elementOnly",
      "shrink",
    ]),
    htmlFor: PropTypes.string,
    inputType: PropTypes.string,
  },*/

  // const Components = useVulcanComponents();

  const { htmlFor } = props;

  const renderLabel = function ({
    fakeLabel,
    hideLabel,
    shrinkLabel,
    layout,
    label,
    value,
    optional,
    required,
  }: FormControlLayoutProps) {
    const isRequired = !optional || required;

    if (layout === "elementOnly" || hideLabel) {
      return null;
    }

    if (fakeLabel) {
      return (
        <FormLabel
          className="control-label legend"
          component="legend"
          data-required={isRequired}
        >
          {label}
          <RequiredIndicator optional={!isRequired} value={value} />
        </FormLabel>
      );
    }

    const shrink =
      shrinkLabel || ["date", "time", "datetime"].includes(props.inputType)
        ? true
        : undefined;

    return (
      <InputLabel
        className="control-label"
        data-required={isRequired}
        htmlFor={htmlFor}
        shrink={shrink}
      >
        {label}
        {/** Components.RequiredIndicator */}
        <RequiredIndicator optional={!isRequired} value={value} />
      </InputLabel>
    );
  };

  const { layout, className, children, hasErrors } = props;

  if (layout === "elementOnly") {
    return <span>{children}</span>;
  }

  return (
    <FormControl
      component="fieldset"
      error={hasErrors}
      fullWidth={layout !== "shrink"}
      className={className}
    >
      {renderLabel(props)}
      {children}
    </FormControl>
  );
};

export default FormControlLayout;
