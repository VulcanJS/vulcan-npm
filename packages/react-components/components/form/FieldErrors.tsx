import React from "react";
import PropTypes from "prop-types";
import { useVulcanComponents } from "./VulcanComponentsContext";

// Track dependencies, not used yet
export const formComponentsDependencies = ["FormError"];

export const FieldErrors = ({ errors }) => {
  const VulcanComponents = useVulcanComponents();
  return (
    <ul className="form-input-errors">
      {errors.map((error, index) => (
        <li key={index}>
          <VulcanComponents.FormError error={error} errorContext="field" />
        </li>
      ))}
    </ul>
  );
};
FieldErrors.propTypes = {
  errors: PropTypes.array.isRequired,
};
