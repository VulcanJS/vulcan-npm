import React from "react";
import { Alert } from "react-bootstrap";
import { registerComponent } from "meteor/vulcan:lib";

const BootstrapAlert = ({ children, variant = "danger", ...rest }) => (
  <Alert variant={variant} {...rest}>
    {children}
  </Alert>
);

registerComponent("Alert", BootstrapAlert);
