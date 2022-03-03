import React from "react";

// Number
export const CardItemNumber = ({ value }: { value?: any }) => (
  <code className="contents-number">{value.toString()}</code>
);
