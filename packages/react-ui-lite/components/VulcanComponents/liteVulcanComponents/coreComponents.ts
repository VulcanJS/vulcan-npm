import { FormattedMessage } from "@vulcanjs/react-i18n";
import { Button, Loading, HeadTags, TooltipTrigger, Alert } from "../../core";

import {
  defaultCoreComponents,
  PossibleCoreComponents,
} from "@vulcanjs/react-ui";

/**
 * Minimal set of components, mandatory to operate Vulcan React UI
 */
export const liteCoreComponents: Partial<PossibleCoreComponents> = {
  ...defaultCoreComponents,
  // core components taht were used in forms
  Loading,
  Alert,
  Button,
  Icon: () => null,
  // i18n
  FormattedMessage,
  // core
  HeadTags,
  TooltipTrigger,
};
