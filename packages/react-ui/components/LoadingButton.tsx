import React, { CSSProperties } from "react";
import { useVulcanComponents } from "./VulcanComponents";

export interface LoadingButtonProps /*extends ButtonProps*/ {
  loading?: boolean;
  label?: string;
  onClick?: any;
  children?: React.ReactNode;
  className?: string;
}
export const LoadingButton = ({
  loading,
  label,
  onClick,
  children,
  className = "",
  ...rest
}: LoadingButtonProps & any) => {
  const Components = useVulcanComponents();

  const wrapperStyle: CSSProperties = {
    position: "relative",
  };

  const labelStyle = loading ? { opacity: 0.5 } : {};

  const loadingStyle: CSSProperties = loading
    ? {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }
    : { display: "none" };

  return (
    <Components.Button
      className={`loading-button ${
        loading ? "loading-button-loading" : "loading-button-notloading"
      } ${className}`}
      onClick={onClick}
      {...rest}
    >
      <span style={wrapperStyle}>
        <span style={labelStyle}>{label || children}</span>
        <span style={loadingStyle}>
          <Components.Loading />
        </span>
      </span>
    </Components.Button>
  );
};
