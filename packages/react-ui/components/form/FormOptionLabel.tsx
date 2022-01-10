import React from "react";

export const FormOptionLabel = ({ option }) => {
  const { label } = option;
  // NOTE: for radio groups we might need to wrap this with a label? And maybe even for select?
  return <span className="form-option-label">{label}</span>;
};
