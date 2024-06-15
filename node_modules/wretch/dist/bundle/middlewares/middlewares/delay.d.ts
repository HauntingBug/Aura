import type { ConfiguredMiddleware } from "../types.js";
/**
 * ##  Delay middleware
 *
 * ### Delays the request by a specific amount of time.
 *
 * **Options**
 *
 * - *time* `milliseconds`
 *
 * > The request will be delayed by that amount of time.
 */
export type DelayMiddleware = (time: number) => ConfiguredMiddleware;
export declare const delay: DelayMiddleware;
