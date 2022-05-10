import { FormattedMessage } from "@vulcanjs/react-i18n";
import { Button } from "../../core/Button";
import { Loading } from "../../core/Loading";

import { HeadTags } from "../../core/HeadTags";

// TODO: rewrite to remove dep to react-bootstrap
import { TooltipTrigger } from "../../bootstrap/TooltipTrigger";
import Dropdown from "../../bootstrap/Dropdown";

import {
  defaultCoreComponents,
  PossibleCoreComponents,
} from "@vulcanjs/react-ui";
import { BootstrapModal } from "../../bootstrap/Modal";
import { ModalTrigger } from "../../bootstrap/ModalTrigger";

/**
 * Minimal set of components, mandatory to operate Vulcan React UI
 */
export const liteCoreComponents: PossibleCoreComponents = {
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
  //
  TooltipTrigger,
  Dropdown,
  Modal: BootstrapModal,
  ModalTrigger,
};
