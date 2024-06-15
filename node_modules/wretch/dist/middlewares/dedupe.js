/* Defaults */
const defaultSkip = (_, opts) => (opts.skipDedupe || opts.method !== "GET");
const defaultKey = (url, opts) => opts.method + "@" + url;
const defaultResolver = response => response.clone();
export const dedupe = ({ skip = defaultSkip, key = defaultKey, resolver = defaultResolver } = {}) => {
    const inflight = new Map();
    return next => (url, opts) => {
        if (skip(url, opts)) {
            return next(url, opts);
        }
        const _key = key(url, opts);
        if (!inflight.has(_key)) {
            inflight.set(_key, []);
        }
        else {
            return new Promise((resolve, reject) => {
                inflight.get(_key).push([resolve, reject]);
            });
        }
        try {
            return next(url, opts)
                .then(response => {
                // Resolve pending promises
                inflight.get(_key).forEach(([resolve]) => resolve(resolver(response)));
                // Remove the inflight pending promises
                inflight.delete(_key);
                // Return the original response
                return response;
            })
                .catch(error => {
                // Reject pending promises on error
                inflight.get(_key).forEach(([resolve, reject]) => reject(error));
                inflight.delete(_key);
                throw error;
            });
        }
        catch (error) {
            inflight.delete(_key);
            return Promise.reject(error);
        }
    };
};
//# sourceMappingURL=dedupe.js.map