import { isPromise } from "@vulcanjs/utils";
/**
 * Helper to run callbacks
 */
// import { debug } from './debug.js';
// import { Utils } from './utils';
// import merge from 'lodash/merge';


import debug from "debug"
const debugCb = debug("vulcan:callback")

interface RunCallbacksArgs<TItem = any> {
    callbacks: Array<Function>,
    item?: TItem;
    args?: any;
    hookName?: string; // for debug
}
/**
 * @summary Successively run all of a hook's callbacks on an item
 * @param {Object} item - Second argument: the post, comment, modifier, etc. on which to run the callbacks
 * @param {Any} args - Other arguments will be passed to each successive iteration
 * @param {Array} callbacks - Optionally, pass an array of callback functions instead of passing a hook name
 * @returns {Object} Returns the item after it's been through all the callbacks for this hook
 */
export const runCallbacks = function ({ item, args, callbacks, hookName = "unkown hook" }: RunCallbacksArgs) {
    // flag used to detect the callback that initiated the async context
    let asyncContext = false;

    if (typeof callbacks !== 'undefined' && callbacks.length > 0) { // if the hook exists, and contains callbacks to run
        const runCallback = (accumulator, callback) => {
            debugCb(`Running callback ${callback.name} on hook ${hookName}`);
            const newArguments = [accumulator].concat(args);

            try {
                const result = callback.apply(this, newArguments);
                if (typeof result === 'undefined') {
                    // if result of current iteration is undefined, don't pass it on
                    // debug(`// Warning: Sync callback [${callback.name}] in hook [${hook}] didn't return a result!`)
                    return accumulator;
                } else {
                    return result;
                }

            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(`Error at callback ${callback.name} on hook ${hookName}`, error);
                // the error can be ignored or not, depending if the cb is critical or not
                if (error.break || error.data && error.data.break) {
                    throw error;
                }
                // pass the unchanged accumulator to the next iteration of the loop
                return accumulator;
            }
        };

        return callbacks.reduce(function (accumulator, callback, index) {
            if (isPromise(accumulator)) {
                if (!asyncContext) {
                    debugCb(`Started async context in hook ${hookName}] by ${callbacks[index - 1] && callbacks[index - 1].name}`);
                    asyncContext = true;
                }
                return new Promise((resolve, reject) => {
                    accumulator
                        .then(result => {
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

    } else { // else, just return the item unchanged
        return item;
    }
};

/**
 * @summary Successively run all of a hook's callbacks on an item, in async mode (only works on server)
 * @param {String} hook - First argument: the name of the hook
 * @param {Any} args - Other arguments will be passed to each successive iteration
 */
/*
export const runCallbacksAsync = function () {
    let hook, args, callbacks, formattedHook;
    if (typeof arguments[0] === 'object' && arguments.length === 1) {
        const singleArgument = arguments[0];
        hook = singleArgument.name;
        formattedHook = formatHookName(hook);
        args = [singleArgument.properties]; // wrap in array for apply
        callbacks = singleArgument.callbacks ? singleArgument.callbacks : Callbacks[formattedHook];
    } else {
        // OpenCRUD backwards compatibility
        // the first argument is the name of the hook or an array of functions
        hook = arguments[0];
        formattedHook = formatHookName(hook);
        callbacks = Array.isArray(hook) ? hook : Callbacks[formattedHook];
        // successive arguments are passed to each iteration
        args = Array.prototype.slice.call(arguments).slice(1);
        // if first argument is an array, use that as callbacks array; else use formatted hook name
        callbacks = Array.isArray(hook) ? hook : Callbacks[formattedHook];
    }

    if (typeof callbacks !== 'undefined' && !!callbacks.length) {
        const _runCallbacksAsync = () =>
            Promise.all(
                callbacks.map(callback => {
                    if (!callback) {
                        throw new Error(`Found undefined callback on hook ${hook}`);
                    }
                    debug(`\x1b[32m>> Running async callback [${callback.name}] on hook [${hook}]\x1b[0m`);
                    return callback.apply(this, args);
                }),
            );

        if (Meteor.isServer) {
            // TODO: find out if we can safely use promises on the server, too - https://github.com/VulcanJS/Vulcan/pull/2065
            return new Promise(async (resolve, reject) => {
                Meteor.defer(function () {
                    _runCallbacksAsync().then(resolve).catch(reject);
                });
            });
        }
        return _runCallbacksAsync();
    }
    return [];
};
*/
