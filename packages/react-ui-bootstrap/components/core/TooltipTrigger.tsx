/*

children: the content of the tooltip
trigger: the component that triggers the tooltip to appear

*/
import React from "react";
import { Tooltip, OverlayTrigger } from "react-bootstrap";

export const TooltipTrigger = ({
  children,
  trigger,
  placement = "top" as const,
  ...rest
}) => {
  const tooltip = <Tooltip id="tooltip">{children}</Tooltip>;

  return (
    <OverlayTrigger placement={placement} {...rest} overlay={tooltip}>
      {trigger}
    </OverlayTrigger>
  );
};
