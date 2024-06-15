import type { Wretch, WretchAddon } from "../types.js";
export interface QueryStringAddon {
    /**
     * Converts a javascript object to query parameters, then appends this query string
     * to the current url. String values are used as the query string verbatim.
     *
     * Pass `true` as the second argument to replace existing query parameters.
     *
     * ```
     * import QueryAddon from "wretch/addons/queryString"
     *
     * let w = wretch("http://example.com").addon(QueryStringAddon);
     * // url is http://example.com
     * w = w.query({ a: 1, b: 2 });
     * // url is now http://example.com?a=1&b=2
     * w = w.query({ c: 3, d: [4, 5] });
     * // url is now http://example.com?a=1&b=2c=3&d=4&d=5
     * w = w.query("five&six&seven=eight");
     * // url is now http://example.com?a=1&b=2c=3&d=4&d=5&five&six&seven=eight
     * w = w.query({ reset: true }, true);
     * // url is now  http://example.com?reset=true
     * ```
     *
     * ##### **Note that .query is not meant to handle complex cases with nested objects.**
     *
     * For this kind of usage, you can use `wretch` in conjunction with other libraries
     * (like [`qs`](https://github.com/ljharb/qs)).
     *
     * ```js
     * // Using wretch with qs
     *
     * const queryObject = { some: { nested: "objects" } };
     * const w = wretch("https://example.com/").addon(QueryStringAddon)
     *
     * // Use .qs inside .query :
     *
     * w.query(qs.stringify(queryObject));
     *
     * // Use .defer :
     *
     * const qsWretch = w.defer((w, url, { qsQuery, qsOptions }) => (
     *   qsQuery ? w.query(qs.stringify(qsQuery, qsOptions)) : w
     * ));
     *
     * qsWretch
     *   .url("https://example.com/")
     *   .options({ qs: { query: queryObject } });
     * ```
     *
     * @param qp - An object which will be converted, or a string which will be used verbatim.
     */
    query<T extends QueryStringAddon, C, R>(this: T & Wretch<T, C, R>, qp: object | string, replace?: boolean): this;
}
/**
 * Adds the ability to append query parameters from a javascript object.
 *
 * ```js
 * import QueryAddon from "wretch/addons/queryString"
 *
 * wretch().addon(QueryAddon)
 * ```
 */
declare const queryString: WretchAddon<QueryStringAddon>;
export default queryString;
