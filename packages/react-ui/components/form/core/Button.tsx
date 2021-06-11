import React from "react";

// TODO: whitelist HTMLButton props
export const Button: React.FC = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);
