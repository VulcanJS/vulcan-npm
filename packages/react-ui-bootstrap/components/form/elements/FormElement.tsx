import React, { HTMLAttributes, PropsWithChildren } from "react";
import { useFormContext } from '@vulcanjs/react-ui';
import { Form } from 'react-bootstrap';

// TODO: not sure of the expected props
export const FormElement = /*Form*/ React.forwardRef<HTMLFormElement>(
    ({ children, ...otherProps }: PropsWithChildren<any/*FormElementProps*/>, ref) => {
        const { submitForm } = useFormContext();
        return (
            <Form
                {...otherProps}
                // @ts-ignore
                onSubmit={submitForm}
                ref={ref}
            >
                {children}
            </Form>
        );
    }
);