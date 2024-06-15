import type { WretchResponseChain, WretchAddon } from "../types.js";
export interface PerfsAddon {
    /**
     * Performs a callback on the API performance timings of the request.
     *
     * Warning: Still experimental on browsers and node.js
     */
    perfs: <T, C extends PerfsAddon, R>(this: C & WretchResponseChain<T, C, R>, cb?: (timing: any) => void) => this;
}
/**
 * Adds the ability to measure requests using the Performance Timings API.
 *
 * Uses the Performance API
 * ([browsers](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API) &
 * [node.js](https://nodejs.org/api/perf_hooks.html)) to expose timings related to
 * the underlying request.
 *
 * Browser timings are very accurate, node.js only contains raw measures.
 *
 * ```js
 * import PerfsAddon from "wretch/addons/perfs"
 *
 * // Use perfs() before the response types (text, json, ...)
 * wretch("...")
 *   .addon(PerfsAddon())
 *   .get()
 *   .perfs((timings) => {
 *     // Will be called when the timings are ready.
 * console.log(timings.startTime);
 *   })
 *   .res();
 *
 * ```
 *
 * For node.js, there is a little extra work to do :
 *
 * ```js
 * // Node.js only
 * const { performance, PerformanceObserver } = require("perf_hooks");
 *
 * wretch.polyfills({
 *   fetch: function (url, opts) {
 *     performance.mark(url + " - begin");
 *     return fetch(url, opts).then(res => {
 *       performance.mark(url + " - end");
 *       setTimeout(() => performance.measure(res.url, url + " - begin", url + " - end"), 0);
 *       return res;
 *     });
 *   },
 *   // other polyfills…
 *   performance: performance,
 *   PerformanceObserver: PerformanceObserver,
 * });
 * ```
 */
declare const perfs: () => WretchAddon<unknown, PerfsAddon>;
export default perfs;
