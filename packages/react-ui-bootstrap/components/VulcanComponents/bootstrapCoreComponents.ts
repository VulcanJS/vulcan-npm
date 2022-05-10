import { Button } from "../core/Button";
import { TooltipTrigger } from "../core/TooltipTrigger";
import { PossibleCoreComponents } from "@vulcanjs/react-ui";

// Specific to boostrap, not coded yet in "lite" version
import Dropdown from "../bootstrap/Dropdown";
import { BootstrapModal } from "../bootstrap/Modal";
import { ModalTrigger } from "../bootstrap/ModalTrigger";
import { liteCoreComponents } from "@vulcanjs/react-ui-lite";

export const bootstrapCoreComponents: Partial<PossibleCoreComponents> = {
  // TODO: boostrap doesn't include all components so we also
  // include the lite versio
  ...liteCoreComponents,
  Button,
  TooltipTrigger,
  Dropdown,
  ModalTrigger,
  Modal: BootstrapModal,
};
