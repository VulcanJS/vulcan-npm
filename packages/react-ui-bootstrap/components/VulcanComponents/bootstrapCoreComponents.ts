import { Alert } from "../core";
import { Button } from "../core/Button";
import { TooltipTrigger } from "../core/TooltipTrigger";
import {
  defaultCoreComponents,
  PossibleCoreComponents,
} from "@vulcanjs/react-ui";

// Specific to boostrap, not coded yet in "lite" version
import Dropdown from "../bootstrap/Dropdown";
import { BootstrapModal } from "../bootstrap/Modal";
import { ModalTrigger } from "../bootstrap/ModalTrigger";
import { liteCoreComponents } from "@vulcanjs/react-ui-lite";
import { FormattedMessage } from "@vulcanjs/react-i18n";

export const bootstrapCoreComponents: Partial<PossibleCoreComponents> = {
  ...defaultCoreComponents,
  // TODO: boostrap doesn't include all components so we also
  // include the lite versio
  ...liteCoreComponents,
  FormattedMessage,
  Alert,
  Button,
  TooltipTrigger,
  Dropdown,
  ModalTrigger,
  Modal: BootstrapModal,
};
