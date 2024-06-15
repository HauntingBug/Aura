function stringify(value) {
    return typeof value !== "undefined" ? value : "";
}
const appendQueryParams = (url, qp, replace, config) => {
    let queryString;
    if (typeof qp === "string") {
        queryString = qp;
    }
    else {
        const usp = config.polyfill("URLSearchParams", true, true);
        for (const key in qp) {
            const value = qp[key];
            if (qp[key] instanceof Array) {
                for (const val of value)
                    usp.append(key, stringify(val));
            }
            else {
                usp.append(key, stringify(value));
            }
        }
        queryString = usp.toString();
    }
    const split = url.split("?");
    if (!queryString)
        return replace ? split[0] : url;
    if (replace || split.length < 2)
        return split[0] + "?" + queryString;
    return url + "&" + queryString;
};
/**
 * Adds the ability to append query parameters from a javascript object.
 *
 * ```js
 * import QueryAddon from "wretch/addons/queryString"
 *
 * wretch().addon(QueryAddon)
 * ```
 */
const queryString = {
    wretch: {
        query(qp, replace = false) {
            return { ...this, _url: appendQueryParams(this._url, qp, replace, this._config) };
        }
    }
};
export default queryString;
//# sourceMappingURL=queryString.js.map