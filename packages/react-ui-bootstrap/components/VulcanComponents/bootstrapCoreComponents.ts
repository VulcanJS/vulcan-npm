import { Button } from "../core/Button";
import { TooltipTrigger } from "../core/TooltipTrigger";
import { PossibleCoreComponents } from "@vulcanjs/react-ui";

// Specific to boostrap, not coded yet in "lite" version
import Dropdown from "../bootstrap/Dropdown";
import { BootstrapModal } from "../bootstrap/Modal";
import { ModalTrigger } from "../bootstrap/ModalTrigger";

export const bootstrapCoreComponents: Partial<PossibleCoreComponents> = {
  Button,
  TooltipTrigger,
  Dropdown,
  ModalTrigger,
  Modal: BootstrapModal,
};
