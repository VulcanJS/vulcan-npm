import React from "react"
/**
 * This was normally a Boostrap component,
 * however we need it for the Datatable to display
 * errors correctly
 */

import classNames from "classnames"

// TODO: expose from react-ui
export interface AlertProps {
    variant?: string,
    className?: string;
    children: React.ReactNode
}
export const Alert = ({ variant, className, children }: AlertProps) => {
    return <div className={classNames("vulcan-alert", variant, className)}>
        {children}
    </div>
}