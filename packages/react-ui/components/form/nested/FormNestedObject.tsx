import React from "react";
import PropTypes from "prop-types";
import _omit from "lodash/omit.js";
import { useVulcanComponents } from "../../VulcanComponents/Consumer";
import { useFormContext } from "../core/FormContext";

// Replaceable layout
export const FormNestedObjectLayout = ({ hasErrors, label, content }) => (
  <div
    className={`form-group row form-nested ${hasErrors ? "input-error" : ""}`}
  >
    <label className="control-label col-sm-3">{label}</label>
    <div className="col-sm-9">{content}</div>
  </div>
);
FormNestedObjectLayout.propTypes = {
  hasErrors: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  label: PropTypes.node,
  content: PropTypes.node,
};

interface FormNestedObjectProps {
  label?: string;
  value: any;
  input: any;
  inputProperties: any;
  nestedInput: any;
  errors: Array<any>;
  path: string;
}
export const FormNestedObject = (props: FormNestedObjectProps) => {
  const VulcanComponents = useVulcanComponents();
  //const value = this.getCurrentValue()
  // do not pass FormNested's own value, input and inputProperties props down
  const properties = _omit(
    props,
    "value",
    "input",
    "inputProperties",
    "nestedInput"
  );
  const { errors } = useFormContext();
  // only keep errors specific to the nested array (and not its subfields)
  const nestedObjectErrors = errors.filter(
    (error) => error.path && error.path === props.path
  );
  const hasErrors = nestedObjectErrors && nestedObjectErrors.length;
  return (
    <VulcanComponents.FormNestedObjectLayout
      hasErrors={hasErrors}
      label={props.label}
      content={[
        <VulcanComponents.FormNestedItem
          key="form-nested-item"
          {...properties}
          path={`${props.path}`}
        />,
        hasErrors ? (
          <VulcanComponents.FieldErrors
            key="form-nested-errors"
            errors={nestedObjectErrors}
          />
        ) : null,
      ]}
    />
  );
};

FormNestedObject.propTypes = {
  currentValues: PropTypes.object,
  path: PropTypes.string,
  label: PropTypes.string,
  errors: PropTypes.array.isRequired,
  formComponents: PropTypes.object,
};

export default FormNestedObject;
