import { useIntlContext } from "@vulcanjs/i18n";
import { useEffect, useRef } from "react";
import { isNotSameDocument } from "./utils";

/**
 * Can trigger an alert on unsaved changes
 *
 * @see https://github.com/ReactTraining/history/blob/master/docs/blocking-transitions.md
 *
 * @param param0
 */
export const FormLeavingManager: React.FC<{
  initialDocument: any;
  currentDocument: any;
  warnUnsavedChanges?: boolean;
  history: { block: Function };
}> = ({
  initialDocument,
  currentDocument,
  warnUnsavedChanges,
  history,
  children,
}) => {
  // function to unblock the form
  const unblockRef = useRef<Function | undefined>();
  const context = useIntlContext();
  const isChanged = isNotSameDocument(initialDocument, currentDocument);
  useEffect(() => {
    checkRouteChange(isChanged);
    checkBrowserClosing();
    return () => {
      if (warnUnsavedChanges) {
        if (unblockRef.current) {
          unblockRef.current();
        }
        // unblock browser change
        // @ts-ignore
        window.onbeforeunload = undefined; //undefined instead of null to support IE
      }
    };
  }, [isChanged, warnUnsavedChanges]);

  // check for route change, prevent form content loss
  const checkRouteChange = (isChanged) => {
    // @see https://github.com/ReactTraining/react-router/issues/4635#issuecomment-297828995
    // @see https://github.com/ReactTraining/history#blocking-transitions
    if (warnUnsavedChanges) {
      unblockRef.current = history.block((location, action) => {
        // return the message that will pop into a window.confirm alert
        // if returns nothing, the message won't appear and the user won't be blocked
        return handleRouteLeave(isChanged);

        /*
            // React-router 3 implementtion
            const routes = this.props.router.routes;
            const currentRoute = routes[routes.length - 1];
            this.props.router.setRouteLeaveHook(currentRoute, this.handleRouteLeave);

            */
      });
    }
  };
  // check for browser closing
  const checkBrowserClosing = () => {
    //check for closing the browser with unsaved changes too
    window.onbeforeunload = handlePageLeave;
  };

  /*
  Check if the user has unsaved changes, returns a message if yes
  and nothing if not
  */
  const handleRouteLeave = (isChanged) => {
    if (isChanged) {
      const message = context.formatMessage({
        id: "forms.confirm_discard",
        defaultMessage: "Are you sure you want to discard your changes?",
      });
      return message;
    }
  };

  /**
   * Same for browser closing
   *
   * see https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
   * the message returned is actually ignored by most browsers and a default message 'Are you sure you want to leave this page? You might have unsaved changes' is displayed. See the Notes section on the mozilla docs above
   */
  const handlePageLeave = (event) => {
    if (isChanged) {
      const message = context.formatMessage({
        id: "forms.confirm_discard",
        defaultMessage: "Are you sure you want to discard your changes?",
      });
      if (event) {
        event.returnValue = message;
      }

      return message;
    }
  };
  return <>{children}</>;
};
