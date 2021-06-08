import React, { HTMLAttributes, PropsWithChildren } from "react";
import { useFormContext } from "./FormContext";

export type FormElementProps = HTMLAttributes<HTMLFormElement>;
/**
 * The actual wrapper of the form
 */
export const FormElement = React.forwardRef<HTMLFormElement>(
  ({ children, ...otherProps }: PropsWithChildren<FormElementProps>, ref) => {
    const { submitForm } = useFormContext();
    return (
      <form {...otherProps} onSubmit={submitForm} ref={ref}>
        {children}
      </form>
    );
  }
);
