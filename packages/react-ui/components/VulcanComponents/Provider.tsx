/**
 * NOTE: KEEP SEPARATED FROM THE HOOKS TO CONSUME THE CONTEXT
 * otherwise you'll end up with circular dependencies because of the default components
 */
// TODO: we might need to adapt the provider to merge its value with a potentially higher up context
import React from "react";

import { defaultVulcanComponents } from "./defaultVulcanComponents";
import { PossibleVulcanComponents } from "./typings";
import { VulcanComponentsContext } from "./Context";
import { useVulcanComponents } from "./Consumer";

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
}) => {
  const currentComponents = useVulcanComponents();
  const mergedComponents = {
    ...defaultVulcanComponents,
    // merge with a parent Provider if needed
    ...(currentComponents?.__not_intialized ? {} : currentComponents || {}),
    ...(value || {}),
  };
  // For preserving displayName, that is lost after build somehow
  Object.keys(mergedComponents).forEach((componentName) => {
    mergedComponents[componentName].displayName = componentName;
  });
  return (
    <VulcanComponentsContext.Provider
      value={mergedComponents} // merge provided components so the user can provide only a partial replacement
      {...props}
    />
  );
};
