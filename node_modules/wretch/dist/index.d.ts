import { setOptions, setErrorType, setPolyfills } from "./config.js";
import type { Wretch } from "./types.js";
export type { Wretch, Config, ConfiguredMiddleware, FetchLike, Middleware, WretchResponseChain, WretchOptions, WretchError, WretchErrorCallback, WretchResponse, WretchDeferredCallback, WretchAddon } from "./types.js";
/**
 * Creates a new wretch instance with a base url and base
 * [fetch options](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch).
 *
 * ```ts
 * import wretch from "wretch"
 *
 * // Reusable instance
 * const w = wretch("https://domain.com", { mode: "cors" })
 * ```
 *
 * @param _url The base url
 * @param _options The base fetch options
 * @returns A fresh wretch instance
 */
declare function factory(_url?: string, _options?: {}): Wretch;
declare namespace factory {
    var _a: typeof factory;
    export var options: typeof setOptions;
    export var errorType: typeof setErrorType;
    export var polyfills: typeof setPolyfills;
    export var WretchError: typeof import("./resolver.js").WretchError;
    export { _a as default };
}
export default factory;
