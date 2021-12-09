import { deprecate } from "@vulcanjs/utils";
import React, { useContext } from "react";
import { VulcanComponentsContext } from "./Context";
import { PossibleVulcanComponents } from "./typings";

export const VulcanComponentsConsumer = VulcanComponentsContext.Consumer;

export const useVulcanComponents = () => useContext(VulcanComponentsContext);

export const withVulcanComponents = (C) => (props) => {
  const vulcanComponents = useVulcanComponents();
  deprecate(
    "0.0.0",
    "Using withVulcanComponents HOC => prefer useVulcanComponents with hooks"
  );
  return <C vulcanComponents={vulcanComponents} {...props} />;
};
