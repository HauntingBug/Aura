import type { ConfiguredMiddleware, FetchLike } from "./types.js";
/**
 * @private @internal
 */
export declare const middlewareHelper: (middlewares: ConfiguredMiddleware[]) => (fetchFunction: FetchLike) => FetchLike;
