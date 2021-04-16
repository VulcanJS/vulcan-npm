import React from "react";
import PropTypes from "prop-types";
import { useFormComponents } from "./FormComponentsContext";

// Track dependencies, not used yet
export const formComponentsDependencies = ["FormError"];

export const FieldErrors = ({ errors }) => {
  const { FormError } = useFormComponents();
  return (
    <ul className="form-input-errors">
      {errors.map((error, index) => (
        <li key={index}>
          <FormError error={error} errorContext="field" />
        </li>
      ))}
    </ul>
  );
};
FieldErrors.propTypes = {
  errors: PropTypes.array.isRequired,
};
