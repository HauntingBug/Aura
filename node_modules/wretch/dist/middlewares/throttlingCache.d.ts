import type { WretchOptions, ConfiguredMiddleware } from "../types.js";
export type ThrottlingCacheSkipFunction = (url: string, opts: WretchOptions) => boolean;
export type ThrottlingCacheKeyFunction = (url: string, opts: WretchOptions) => string;
export type ThrottlingCacheClearFunction = (url: string, opts: WretchOptions) => boolean;
export type ThrottlingCacheInvalidateFunction = (url: string, opts: WretchOptions) => string | RegExp | void;
export type ThrottlingCacheConditionFunction = (response: WretchOptions) => boolean;
export type ThrottlingCacheOptions = {
    throttle?: number;
    skip?: ThrottlingCacheSkipFunction;
    key?: ThrottlingCacheKeyFunction;
    clear?: ThrottlingCacheClearFunction;
    invalidate?: ThrottlingCacheInvalidateFunction;
    condition?: ThrottlingCacheConditionFunction;
    flagResponseOnCacheHit?: string;
};
/**
 * ## Throttling cache middleware
 *
 * #### A throttling cache which stores and serves server responses for a certain amount of time.
 *
 * **Options**
 *
 * - *throttle* `milliseconds`
 *
 * > the response will be stored for this amount of time before being deleted from the cache.
 *
 * - *skip* `(url, opts) => boolean`
 *
 * > If skip returns true, then the request is performed even if present in the cache.
 *
 * - *key* `(url, opts) => string`
 *
 * > Returns a key that is used to identify the request.
 *
 * - *clear* `(url, opts) => boolean`
 *
 * > Clears the cache if true.
 *
 * - *invalidate* `(url, opts) => string | RegExp | null`
 *
 * > Removes url(s) matching the string/RegExp from the cache.
 *
 * - *condition* `response => boolean`
 *
 * > If false then the response will not be added to the cache.
 *
 * - *flagResponseOnCacheHit* `string`
 *
 * > If set, a Response returned from the cache whill be flagged with a property name equal to this option.
 *
 */
export type ThrottlingCacheMiddleware = (options?: ThrottlingCacheOptions) => ConfiguredMiddleware & {
    cacheResponse(key: any, response: any): void;
    cache: Map<any, any>;
    inflight: Map<any, any>;
    throttling: Set<unknown>;
};
export declare const throttlingCache: ThrottlingCacheMiddleware;
