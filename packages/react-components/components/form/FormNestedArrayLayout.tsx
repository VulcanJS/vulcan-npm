import PropTypes from "prop-types";
import React from "react";
import { useVulcanComponents } from "./VulcanComponentsContext";

// Replaceable layout, default implementation
export const FormNestedArrayLayout = (props) => {
  const {
    hasErrors,
    nestedArrayErrors,
    label,
    addItem,
    BeforeComponent,
    AfterComponent,
    children,
  } = props;
  const VulcanComponents = useVulcanComponents();

  return (
    <div
      className={`form-group row form-nested ${hasErrors ? "input-error" : ""}`}
    >
      {<BeforeComponent {...props} />}

      <label className="control-label col-sm-3">{label}</label>

      <div className="col-sm-9">
        {children}
        {addItem && (
          <VulcanComponents.Button
            className="form-nested-button form-nested-add"
            size="sm"
            variant="success"
            onClick={addItem}
          >
            <VulcanComponents.IconAdd height={12} width={12} />
          </VulcanComponents.Button>
        )}
        {props.hasErrors ? (
          <VulcanComponents.FieldErrors
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
