import { useIntlContext } from "@vulcanjs/i18n";
import { useEffect, useRef } from "react";
import { block } from "./block";
import debug from "debug";
const debugTransitions = console.log; //debug("vn:route-transition");

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
  // function to unblock the form
  const unblockRef = useRef<Function | undefined>();
  const context = useIntlContext();
  const shouldBlockTransition = warnUnsavedChanges && isChanged;
  debugTransitions("shouldBlockTransition:", shouldBlockTransition);

  /**
   * To be passed to onbeforeunload event. The returned message will be displayed
   * by the prompt.
   *
   * see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
   * the message returned is actually ignored by most browsers and a default message 'Are you sure you want to leave this page? You might have unsaved changes' is displayed. See the Notes section on the mozilla docs above
   */
  const handlePageLeave = (event) => {
    debugTransitions("running handlePageLeave", event);
    const message = context.formatMessage({
      id: "forms.confirm_discard",
      defaultMessage: "Are you sure you want to discard your changes?",
    });
    if (event) {
      event.returnValue = message;
    }
    return message;
  };

  useEffect(() => {
    const isBlocking = !!unblockRef.current;
    debugTransitions(
      "running effect",
      "should block",
      shouldBlockTransition,
      "currently blocked",
      isBlocking
    );

    const onUnblock = () => {
      debugTransitions("running unblock from effect");
      if (!shouldBlockTransition) {
        if (unblockRef.current) {
          unblockRef.current();
        }
      }
    };
    // block
    if (shouldBlockTransition) {
      debugTransitions(
        "should block transition, setting up relevant event listener"
      );
      unblockRef.current = block(handlePageLeave, onUnblock);
    }
    // unblock if not blocking anymore and was blocking previously
    if (!shouldBlockTransition && isBlocking) {
      debugTransitions("should unblock (state has been reinitialized)");
      unblockRef.current();
    }
    // trigger the potentially registered unblock function when component unmounts
    //return onUnblock;
  }, [shouldBlockTransition]);
};
