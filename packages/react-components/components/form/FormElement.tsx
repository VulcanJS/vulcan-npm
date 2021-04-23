import React from "react";

/**
 * The actual wrapper of the form
 */
export const FormElement = React.forwardRef<HTMLFormElement>(
  ({ children, ...otherProps }, ref) => {
    return (
      <form {...otherProps} ref={ref}>
        {children}
      </form>
    );
  }
);
