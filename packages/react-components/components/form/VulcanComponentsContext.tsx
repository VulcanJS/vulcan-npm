import { deprecate } from "@vulcanjs/utils/debug";
import React, { useContext } from "react";
import {
  defaultVulcanComponents,
  PossibleVulcanComponents,
} from "./defaultVulcanComponents";

export const VulcanComponentsContext = React.createContext<PossibleVulcanComponents>(
  defaultVulcanComponents
);

// TODO: we might need to adapt the provider to merge its value with a potentially higher up context
// So that you can override only some components by adding an additional context while keeping the defaults
export const VulcanComponentsProvider = ({
  value,
  ...props
}: React.ComponentProps<typeof VulcanComponentsProvider> & {
  value: Partial<PossibleVulcanComponents>;
}) => (
  <VulcanComponentsContext.Provider
    value={{ ...defaultVulcanComponents, ...value }} // merge provided components so the user can provide only a partial replacement
    {...props}
  />
);
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
