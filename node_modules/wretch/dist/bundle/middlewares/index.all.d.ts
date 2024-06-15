import { setOptions, setErrorType, setPolyfills } from "./config.js";
import * as Addons from "./addons/index.js";
declare function factory(_url?: string, _options?: {}): Addons.AbortWretch & Addons.FormDataAddon & Addons.FormUrlAddon & Addons.QueryStringAddon & import("./types.js").Wretch<Addons.AbortWretch & Addons.FormDataAddon & Addons.FormUrlAddon & Addons.QueryStringAddon, Addons.AbortResolver & Addons.PerfsAddon & Addons.ProgressResolver, undefined>;
declare namespace factory {
    var _a: typeof factory;
    export var options: typeof setOptions;
    export var errorType: typeof setErrorType;
    export var polyfills: typeof setPolyfills;
    export var WretchError: typeof import("./resolver.js").WretchError;
    export { _a as default };
}
export default factory;
