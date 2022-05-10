import { FormattedMessage } from "@vulcanjs/react-i18n";
import { Button } from "../../core/Button";
import { Loading } from "../../core/Loading";

import { HeadTags } from "../../core/HeadTags";

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
  Alert: () => null,
  Button,
  Icon: () => null,
  // i18n
  FormattedMessage,
  // core
  HeadTags,
};
