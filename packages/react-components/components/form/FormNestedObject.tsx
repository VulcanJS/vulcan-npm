import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { useFormComponents } from "./FormComponentsContext";
import _omit from "lodash/omit";

// Replaceable layout
const FormNestedObjectLayout = ({ hasErrors, label, content }) => (
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
  label: string;
  value: any;
  input: any;
  inputProperties: any;
  nestedInput: any;
  errors: Array<any>;
  path: string;
}
export const FormNestedObject = (props: FormNestedObjectProps) => {
  const FormComponents = useFormComponents();
  //const value = this.getCurrentValue()
  // do not pass FormNested's own value, input and inputProperties props down
  const properties = _omit(
    props,
    "value",
    "input",
    "inputProperties",
    "nestedInput"
  );
  const { errors } = props;
  // only keep errors specific to the nested array (and not its subfields)
  const nestedObjectErrors = errors.filter(
    (error) => error.path && error.path === props.path
  );
  const hasErrors = nestedObjectErrors && nestedObjectErrors.length;
  return (
    <FormComponents.FormNestedObjectLayout
      hasErrors={hasErrors}
      label={props.label}
      content={[
        <FormComponents.FormNestedItem
          key="form-nested-item"
          {...properties}
          path={`${props.path}`}
        />,
        hasErrors ? (
          <FormComponents.FieldErrors
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
