import { useBlockTransition } from "../useBlockTransition/useBlockTransition";

/**
 * Can trigger an alert on unsaved changes
 *
 * Triggers event so you can also block SPA transition (implementation is NOT provided by this hook, you
 * need listeners whose implementation depends on your router (React Router, Next Router...), see block.ts)
 *
 * @see https://github.com/ReactTraining/history/blob/master/docs/blocking-transitions.md
 *
 * @param param0
 */
export const useWarnOnUnsaved = ({
  isChanged,
  warnUnsavedChanges,
}: {
  isChanged: boolean;
  warnUnsavedChanges?: boolean;
}) => {
  useBlockTransition({ shouldBlock: warnUnsavedChanges && isChanged });
};
