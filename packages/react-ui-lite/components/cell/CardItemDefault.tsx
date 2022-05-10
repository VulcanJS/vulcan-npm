import React from "react";

// Default
export const CardItemDefault = ({ value }: { value?: any }) => (
  <span>{value && value.toString()}</span>
);
