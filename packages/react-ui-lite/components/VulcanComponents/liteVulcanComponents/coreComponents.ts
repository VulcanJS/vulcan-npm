import {
  defaultCoreComponents,
  PossibleCoreComponents,
} from "@vulcanjs/react-ui";

/**
 * Minimal set of components, mandatory to operate Vulcan React UI
 */
export const liteCoreComponents: Partial<PossibleCoreComponents> = {
  ...defaultCoreComponents,
  // core components that were used in forms
  Icon: () => null,
};
