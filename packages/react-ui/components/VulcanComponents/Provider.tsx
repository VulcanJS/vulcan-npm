/**
 * NOTE: KEEP SEPARATED FROM THE HOOKS TO CONSUME THE CONTEXT
 * otherwise you'll end up with circular dependencies because of the default components
 */
// TODO: we might need to adapt the provider to merge its value with a potentially higher up context
import React from "react";

import { defaultVulcanComponents } from "./defaultVulcanComponents";
import { PossibleVulcanComponents } from "./typings";
import { VulcanComponentsContext } from "./Context";

/**
 *
 * @param options.value An object of Vulcan components to be overriden.
 */
export const VulcanComponentsProvider = ({
  value,
  ...props
}: {
  value?: Partial<PossibleVulcanComponents>;
  children: React.ReactNode;
}) => (
  <VulcanComponentsContext.Provider
    value={{ ...defaultVulcanComponents, ...(value || {}) }} // merge provided components so the user can provide only a partial replacement
    {...props}
  />
);
