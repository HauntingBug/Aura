import { middlewareHelper } from "./middleware.js";
import { mix } from "./utils.js";
import { FETCH_ERROR, CATCHER_FALLBACK } from "./constants.js";
/**
 * This class inheriting from Error is thrown when the fetch response is not "ok".
 * It extends Error and adds status, text and body fields.
 */
export class WretchError extends Error {
}
export const resolver = (wretch) => {
    const sharedState = Object.create(null);
    wretch = wretch._addons.reduce((w, addon) => addon.beforeRequest &&
        addon.beforeRequest(w, wretch._options, sharedState)
        || w, wretch);
    const { _url: url, _options: opts, _config: config, _catchers: _catchers, _resolvers: resolvers, _middlewares: middlewares, _addons: addons } = wretch;
    const catchers = new Map(_catchers);
    const finalOptions = mix(config.options, opts);
    // The generated fetch request
    let finalUrl = url;
    const _fetchReq = middlewareHelper(middlewares)((url, options) => {
        finalUrl = url;
        return config.polyfill("fetch")(url, options);
    })(url, finalOptions);
    // Throws on an http error
    const referenceError = new Error();
    const throwingPromise = _fetchReq
        .catch(error => {
        throw { [FETCH_ERROR]: error };
    })
        .then(response => {
        if (!response.ok) {
            const err = new WretchError();
            // Enhance the error object
            err["cause"] = referenceError;
            err.stack = err.stack + "\nCAUSE: " + referenceError.stack;
            err.response = response;
            err.url = finalUrl;
            if (response.type === "opaque") {
                throw err;
            }
            return response.text().then((body) => {
                var _a;
                err.message = body;
                if (config.errorType === "json" || ((_a = response.headers.get("Content-Type")) === null || _a === void 0 ? void 0 : _a.split(";")[0]) === "application/json") {
                    try {
                        err.json = JSON.parse(body);
                    }
                    catch (e) { /* ignore */ }
                }
                err.text = body;
                err["status"] = response.status;
                throw err;
            });
        }
        return response;
    });
    // Wraps the Promise in order to dispatch the error to a matching catcher
    const catchersWrapper = (promise) => {
        return promise.catch(err => {
            const fetchErrorFlag = err.hasOwnProperty(FETCH_ERROR);
            const error = fetchErrorFlag ? err[FETCH_ERROR] : err;
            const catcher = ((error === null || error === void 0 ? void 0 : error.status) && catchers.get(error.status)) ||
                catchers.get(error === null || error === void 0 ? void 0 : error.name) || (fetchErrorFlag && catchers.has(FETCH_ERROR) && catchers.get(FETCH_ERROR));
            if (catcher)
                return catcher(error, wretch);
            const catcherFallback = catchers.get(CATCHER_FALLBACK);
            if (catcherFallback)
                return catcherFallback(error, wretch);
            throw error;
        });
    };
    const bodyParser = funName => cb => funName ?
        // If a callback is provided, then callback with the body result otherwise return the parsed body itself.
        catchersWrapper(throwingPromise.then(_ => _ && _[funName]()).then(_ => cb ? cb(_) : _)) :
        // No body parsing method - return the response
        catchersWrapper(throwingPromise.then(_ => cb ? cb(_) : _));
    const responseChain = {
        _wretchReq: wretch,
        _fetchReq,
        _sharedState: sharedState,
        res: bodyParser(null),
        json: bodyParser("json"),
        blob: bodyParser("blob"),
        formData: bodyParser("formData"),
        arrayBuffer: bodyParser("arrayBuffer"),
        text: bodyParser("text"),
        error(errorId, cb) {
            catchers.set(errorId, cb);
            return this;
        },
        badRequest(cb) { return this.error(400, cb); },
        unauthorized(cb) { return this.error(401, cb); },
        forbidden(cb) { return this.error(403, cb); },
        notFound(cb) { return this.error(404, cb); },
        timeout(cb) { return this.error(408, cb); },
        internalError(cb) { return this.error(500, cb); },
        fetchError(cb) { return this.error(FETCH_ERROR, cb); },
    };
    const enhancedResponseChain = addons.reduce((chain, addon) => ({
        ...chain,
        ...addon.resolver
    }), responseChain);
    return resolvers.reduce((chain, r) => r(chain, wretch), enhancedResponseChain);
};
//# sourceMappingURL=resolver.js.map