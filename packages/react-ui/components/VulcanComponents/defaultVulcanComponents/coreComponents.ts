import { FormattedMessage } from "@vulcanjs/react-i18n";
import { Button } from "../../form/core/Button";
import { Loading } from "../../form/core/Loading";

import { LoadingButton } from "../../LoadingButton";
import { MutationButton } from "../../MutationButton";
import { HeadTags } from "../../HeadTags";

// TODO: rewrite to remove dep to react-bootstrap
import { TooltipTrigger } from "../../bootstrap/TooltipTrigger";
import Dropdown from "../../bootstrap/Dropdown";

import type { PossibleCoreComponents } from "../typings";
import { BootstrapModal } from "../../bootstrap/Modal";
import { ModalTrigger } from "../../bootstrap/ModalTrigger";

/**
 * Minimal set of components, mandatory to operate Vulcan React UI
 */
export const defaultCoreComponents: PossibleCoreComponents = {
  // core components taht were used in forms
  Loading,
  Alert: () => null,
  Button,
  Icon: () => null,
  // i18n
  FormattedMessage,
  // core
  LoadingButton,
  MutationButton,
  HeadTags,
  //
  TooltipTrigger,
  Dropdown,
  Modal: BootstrapModal,
  ModalTrigger,
};
