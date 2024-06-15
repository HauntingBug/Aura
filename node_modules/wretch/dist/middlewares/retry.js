/* Defaults */
const defaultDelayRamp = (delay, nbOfAttempts) => delay * nbOfAttempts;
const defaultUntil = response => response && response.ok;
export const retry = ({ delayTimer = 500, delayRamp = defaultDelayRamp, maxAttempts = 10, until = defaultUntil, onRetry = null, retryOnNetworkError = false, resolveWithLatestResponse = false, skip, } = {}) => {
    return next => (url, opts) => {
        let numberOfAttemptsMade = 0;
        if (skip && skip(url, opts)) {
            return next(url, opts);
        }
        const checkStatus = (response, error) => {
            return Promise.resolve(until(response, error)).then(done => {
                // If the response is not suitable
                if (!done) {
                    numberOfAttemptsMade++;
                    if (!maxAttempts || numberOfAttemptsMade <= maxAttempts) {
                        // We need to recurse until we have a correct response and chain the checks
                        return new Promise(resolve => {
                            const delay = delayRamp(delayTimer, numberOfAttemptsMade);
                            setTimeout(() => {
                                if (typeof onRetry === "function") {
                                    Promise.resolve(onRetry({
                                        response,
                                        error,
                                        url,
                                        options: opts,
                                    })).then((values = {}) => {
                                        var _a, _b;
                                        resolve(next((_a = (values && values.url)) !== null && _a !== void 0 ? _a : url, (_b = (values && values.options)) !== null && _b !== void 0 ? _b : opts));
                                    });
                                }
                                else {
                                    resolve(next(url, opts));
                                }
                            }, delay);
                        })
                            .then(checkStatus)
                            .catch(error => {
                            if (!retryOnNetworkError)
                                throw error;
                            return checkStatus(null, error);
                        });
                    }
                    else {
                        return !!response && resolveWithLatestResponse
                            ? response
                            : Promise.reject(error || new Error("Number of attempts exceeded."));
                    }
                }
                return !!response && resolveWithLatestResponse
                    ? response
                    : error
                        ? Promise.reject(error)
                        : response;
            });
        };
        return next(url, opts)
            .then(checkStatus)
            .catch(error => {
            if (!retryOnNetworkError)
                throw error;
            return checkStatus(null, error);
        });
    };
};
//# sourceMappingURL=retry.js.map