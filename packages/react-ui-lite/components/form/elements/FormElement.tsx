import React, { HTMLAttributes, PropsWithChildren } from "react";
import { useFormContext } from "@vulcanjs/react-ui";

export type FormElementProps = HTMLAttributes<HTMLFormElement>;
/**
 * The actual wrapper of the form
 */
export const FormElement = React.forwardRef<HTMLFormElement>(
  ({ children, ...otherProps }: PropsWithChildren<FormElementProps>, ref) => {
    const { submitForm } = useFormContext();
    return (
      <form
        {...otherProps}
        // @ts-ignore
        onSubmit={submitForm}
        ref={ref}
      >
        {children}
      </form>
    );
  }
);
