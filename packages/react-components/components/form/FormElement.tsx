import React from "react";

/**
 * The actual wrapper of the form
 */
export const FormElement = React.forwardRef(({ children, ...otherProps }) => {
  return <form {...otherProps}>{children}</form>;
});
