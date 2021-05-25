import { renderHook, act } from "@testing-library/react-hooks";
import { useBlockTransition } from "../useBlockTransition";
describe("react-components/useBlockTransition", () => {
  test("do nothing if not blocked initially", () => {
    // spy on blocktransition event
    const blockTransitionListener = jest.fn();
    window.addEventListener("blocktransition", blockTransitionListener);
    const unblockTransitionListener = jest.fn();
    window.addEventListener("unblocktransition", unblockTransitionListener);
    const beforeUnloadListener = jest.fn();
    window.addEventListener("beforeunload", beforeUnloadListener);

    const { result } = renderHook(() =>
      useBlockTransition({ shouldBlock: false })
    );
    expect(result.current).toBeUndefined(); // no result
    // triggers an event for 3rd party libraries
    expect(blockTransitionListener).not.toHaveBeenCalled();
    expect(unblockTransitionListener).not.toHaveBeenCalled();
    // listen to unload event
    //window.dispatchEvent("n")
  });
  test("block transition", () => {
    // spy on blocktransition event
    const blockTransitionListener = jest.fn();
    window.addEventListener("blocktransition", blockTransitionListener);
    const unblockTransitionListener = jest.fn();
    window.addEventListener("unblocktransition", unblockTransitionListener);
    const beforeUnloadListener = jest.fn();
    window.addEventListener("beforeunload", beforeUnloadListener);

    const { result } = renderHook(() =>
      useBlockTransition({ shouldBlock: true })
    );
    expect(result.current).toBeUndefined(); // no result
    // triggers an event for 3rd party libraries
    expect(blockTransitionListener).toHaveBeenCalledTimes(1);
    expect(unblockTransitionListener).not.toHaveBeenCalled();
    // listen to unload event
    //window.dispatchEvent("n")
  });
  test("unblock transition after it was being blocked", () => {
    // spy on blocktransition event
    const blockTransitionListener = jest.fn();
    window.addEventListener("blocktransition", blockTransitionListener);
    const unblockTransitionListener = jest.fn();
    window.addEventListener("unblocktransition", unblockTransitionListener);
    // const beforeUnloadListener = jest.fn();
    // window.addEventListener("beforeunload", beforeUnloadListener);

    const { result, rerender } = renderHook(() =>
      useBlockTransition({ shouldBlock: true })
    );
    expect(result.current).toBeUndefined(); // no result
    // triggers an event for 3rd party libraries
    rerender({ shouldBlock: false });
    expect(blockTransitionListener).toHaveBeenCalledTimes(1);
    expect(unblockTransitionListener).toHaveBeenCalledTimes(1);
  });
});
