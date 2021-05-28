import React from "react";

export const FormOptionLabel = ({ option }) => {
  const { label } = option;
  return <span className="form-option-label">{label}</span>;
};
