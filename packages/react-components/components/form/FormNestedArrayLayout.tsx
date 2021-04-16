import PropTypes from "prop-types";
import React from "react";
import { useCoreComponents } from "./CoreComponentsContext";
import { useFormComponents } from "./FormComponentsContext";

// Replaceable layout, default implementation
const FormNestedArrayLayout = (props) => {
  const {
    hasErrors,
    nestedArrayErrors,
    label,
    addItem,
    BeforeComponent,
    AfterComponent,
    children,
  } = props;
  const FormComponents = useFormComponents();
  const CoreComponents = useCoreComponents();

  return (
    <div
      className={`form-group row form-nested ${hasErrors ? "input-error" : ""}`}
    >
      {<BeforeComponent {...props} />}

      <label className="control-label col-sm-3">{label}</label>

      <div className="col-sm-9">
        {children}
        {addItem && (
          <CoreComponents.Button
            className="form-nested-button form-nested-add"
            size="sm"
            variant="success"
            onClick={addItem}
          >
            <FormComponents.IconAdd height={12} width={12} />
          </CoreComponents.Button>
        )}
        {props.hasErrors ? (
          <FormComponents.FieldErrors
            key="form-nested-errors"
            errors={nestedArrayErrors}
          />
        ) : null}
      </div>

      {<AfterComponent {...props} />}
    </div>
  );
};

FormNestedArrayLayout.propTypes = {
  hasErrors: PropTypes.bool.isRequired,
  nestedArrayErrors: PropTypes.array,
  label: PropTypes.node,
  hideLabel: PropTypes.bool,
  addItem: PropTypes.func,
  beforeComponent: PropTypes.node,
  afterComponent: PropTypes.node,
  formComponents: PropTypes.object,
  children: PropTypes.node,
};

export default FormNestedArrayLayout;
