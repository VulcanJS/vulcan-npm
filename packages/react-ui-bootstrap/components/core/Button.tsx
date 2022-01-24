import React from "react";
import BootstrapButton, {
  ButtonProps as BootstrapButtonProps,
} from "react-bootstrap/Button";

export type ButtonProps = BootstrapButtonProps;
export const Button = (props) => <BootstrapButton {...props} />;
