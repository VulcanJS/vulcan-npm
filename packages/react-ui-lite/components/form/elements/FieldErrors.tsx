import React from "react";
import PropTypes from "prop-types";
import { useVulcanComponents } from "@vulcanjs/react-ui";

// Track dependencies, not used yet
const formComponentsDependencies = ["FormError"];

/**
 * Errors for one specif fields
 * @returns
 */
export const FieldErrors = ({
  errors,
}: {
  /**
   * Errors for this specific field only
   */
  errors: Array<any>;
}) => {
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
