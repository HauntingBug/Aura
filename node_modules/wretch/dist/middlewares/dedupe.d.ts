import type { ConfiguredMiddleware, WretchOptions } from "../types.js";
export type DedupeSkipFunction = (url: string, opts: WretchOptions) => boolean;
export type DedupeKeyFunction = (url: string, opts: WretchOptions) => string;
export type DedupeResolverFunction = (response: Response) => Response;
export type DedupeOptions = {
    skip?: DedupeSkipFunction;
    key?: DedupeKeyFunction;
    resolver?: DedupeResolverFunction;
};
/**
 * ## Dedupe middleware
 *
 * #### Prevents having multiple identical requests on the fly at the same time.
 *
 * **Options**
 *
 * - *skip* `(url, opts) => boolean`
 *
 * > If skip returns true, then the dedupe check is skipped.
 *
 * - *key* `(url, opts) => string`
 *
 * > Returns a key that is used to identify the request.
 *
 * - *resolver* `(response: Response) => Response`
 *
 * > This function is called when resolving the fetch response from duplicate calls.
 * By default it clones the response to allow reading the body from multiple sources.
 */
export type DedupeMiddleware = (options?: DedupeOptions) => ConfiguredMiddleware;
export declare const dedupe: DedupeMiddleware;
