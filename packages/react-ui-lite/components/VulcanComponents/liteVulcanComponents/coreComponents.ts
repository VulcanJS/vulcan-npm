import {
  defaultCoreComponents,
  PossibleCoreComponents,
} from "@vulcanjs/react-ui";
import { FormattedMessage } from "@vulcanjs/react-i18n";
import { Button, Loading, TooltipTrigger, Alert } from "../../core";

/**
 * Minimal set of components, mandatory to operate Vulcan React UI
 */
export const liteCoreComponents: Partial<PossibleCoreComponents> = {
  ...defaultCoreComponents,
  Button,
  Loading,
  TooltipTrigger,
  Alert,
  FormattedMessage,
  // core components that were used in forms
  Icon: () => null,
};
