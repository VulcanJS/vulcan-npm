import { deprecate } from "@vulcanjs/utils/debug";
import React, { useContext } from "react";

export interface PossibleCoreComponents {
  Loading: any;
  FormattedMessage: any;
  Alert: any;
  Button: any;
  Icon: any;
}

export const CoreComponentsContext = React.createContext<PossibleCoreComponents>(
  {
    Loading: () => null,
    FormattedMessage: () => null,
    Alert: () => null,
    Button: () => null,
    Icon: () => null,
  }
);

// TODO: we might need to adapt the provider to merge its value with a potentially higher up context
// So that you can override only some components by adding an additional context while keeping the defaults
export const CoreComponentsProvider = CoreComponentsContext.Provider;
export const FormsComponentsConsumer = CoreComponentsContext.Consumer;

export const useCoreComponents = () => useContext(CoreComponentsContext);

export const withCoreComponents = (C) => (props) => {
  const coreComponents = useCoreComponents();
  deprecate(
    "0.0.0",
    "Using withCoreComponents HOC => prefer useCoreComponents with hooks"
  );
  return <C coreComponents={coreComponents} {...props} />;
};
