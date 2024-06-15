/**
 * Adds the ability to abort requests using AbortController and signals under the hood.
 *
 *
 * _Only compatible with browsers that support
 * [AbortControllers](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).
 * Otherwise, you could use a (partial)
 * [polyfill](https://www.npmjs.com/package/abortcontroller-polyfill)._
 *
 * ```js
 * import AbortAddon from "wretch/addons/abort"
 *
 * const [c, w] = wretch("...")
 *   .addon(AbortAddon())
 *   .get()
 *   .onAbort((_) => console.log("Aborted !"))
 *   .controller();
 *
 * w.text((_) => console.log("should never be called"));
 * c.abort();
 *
 * // Or :
 *
 * const controller = new AbortController();
 *
 * wretch("...")
 *   .addon(AbortAddon())
 *   .signal(controller)
 *   .get()
 *   .onAbort((_) => console.log("Aborted !"))
 *   .text((_) => console.log("should never be called"));
 *
 * controller.abort();
 * ```
 */
const abort = () => {
    return {
        beforeRequest(wretch, options, state) {
            const fetchController = wretch._config.polyfill("AbortController", false, true);
            if (!options["signal"] && fetchController) {
                options["signal"] = fetchController.signal;
            }
            const timeout = {
                ref: null,
                clear() {
                    if (timeout.ref) {
                        clearTimeout(timeout.ref);
                        timeout.ref = null;
                    }
                }
            };
            state.abort = {
                timeout,
                fetchController
            };
            return wretch;
        },
        wretch: {
            signal(controller) {
                return { ...this, _options: { ...this._options, signal: controller.signal } };
            },
        },
        resolver: {
            setTimeout(time, controller = this._sharedState.abort.fetchController) {
                const { timeout } = this._sharedState.abort;
                timeout.clear();
                timeout.ref = setTimeout(() => controller.abort(), time);
                return this;
            },
            controller() { return [this._sharedState.abort.fetchController, this]; },
            onAbort(cb) { return this.error("AbortError", cb); }
        },
    };
};
export default abort;
//# sourceMappingURL=abort.js.map