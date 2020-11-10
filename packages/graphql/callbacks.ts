import { isPromise } from "@vulcanjs/utils";
/**
 * Helper to run callbacks
 */
// import { debug } from './debug.js';
// import { Utils } from './utils';
// import merge from 'lodash/merge';

import debug from "debug";
const debugCb = debug("vulcan:callback");

interface RunCallbacksArgs<TItem = any> {
  callbacks: Array<Function>;
  iterator?: TItem;
  args?: Array<any>;
  hookName?: string; // for debug
}
/**
 * @summary Successively run all of a hook's callbacks on an item
 * @param {Object} iterator - Second argument: the post, comment, modifier, etc. on which to run the callbacks
 * @param {Any} args - Other arguments will be passed to each successive iteration
 * @param {Array} callbacks - Optionally, pass an array of callback functions instead of passing a hook name
 * @returns {Object} Returns the item after it's been through all the callbacks for this hook
 */
export const runCallbacks = function ({
  iterator: item,
  args,
  callbacks,
  hookName = "unkown hook",
}: RunCallbacksArgs) {
  // flag used to detect the callback that initiated the async context
  let asyncContext = false;

  if (typeof callbacks !== "undefined" && callbacks.length > 0) {
    // if the hook exists, and contains callbacks to run
    const runCallback = (accumulator, callback) => {
      debugCb(`Running callback ${callback.name} on hook ${hookName}`);
      const newArguments = [accumulator].concat(args);

      try {
        const result = callback.apply(this, newArguments);
        if (typeof result === "undefined") {
          // if result of current iteration is undefined, don't pass it on
          // debug(`// Warning: Sync callback [${callback.name}] in hook [${hook}] didn't return a result!`)
          return accumulator;
        } else {
          return result;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          `Error at callback ${callback.name} on hook ${hookName}`,
          error
        );
        // the error can be ignored or not, depending if the cb is critical or not
        if (error.break || (error.data && error.data.break)) {
          throw error;
        }
        // pass the unchanged accumulator to the next iteration of the loop
        return accumulator;
      }
    };

    return callbacks.reduce(function (accumulator, callback, index) {
      if (isPromise(accumulator)) {
        if (!asyncContext) {
          debugCb(
            `Started async context in hook ${hookName}] by ${
              callbacks[index - 1] && callbacks[index - 1].name
            }`
          );
          asyncContext = true;
        }
        return new Promise((resolve, reject) => {
          accumulator
            .then((result) => {
              try {
                // run this callback once we have the previous value
                resolve(runCallback(result, callback));
              } catch (error) {
                // error will be thrown only for breaking errors, so throw it up in the promise chain
                reject(error);
              }
            })
            .catch(reject);
        });
      } else {
        return runCallback(accumulator, callback);
      }
    }, item);
  } else {
    // else, just return the item unchanged
    return item;
  }
};
