const InMemoryStore = require('./in-memory-store');


class RateLimiter {
    constructor({
                    max = 60,           // Maximum of 60
                    period = 60 * 1000, // For a period of 60 seconds
                    prefix = 'rate-limit-',
                    status = 429,
                    message = 'Too many requests',
                    identifier = request => {
                        return request.ip || request.ips ||               // Read from Default properties
                            (request.headers || {})['x-forwarded-for'] || // Read from Headers
                            (request.connection || {}).remoteAddress ||   // Read from Connection / Socket
                            ((request.connection || {}).socket || {}).remoteAddress; // Read from Connection / Socket
                    },
                    headers = { // Default headers value
                        remaining: 'X-RateLimit-Remaining',
                        reset: 'X-RateLimit-Reset',
                        limit: 'X-RateLimit-Limit'
                    },
                    store = new InMemoryStore() // Default storage in-memory
                } = {}) {

        this._max = max;
        this._period = period;
        this._prefix = prefix;
        this._identifier = identifier;
        this._status = status;
        this._message = message;
        this._headers = headers;
        this._store = store;

        if (this._max <= 0) {
            throw new Error('The maximum value must be greater than 0.');
        }

        if (this._period <= 0) {
            throw new Error('The period value must be greater than 0.');
        }

        if ('function' !== typeof this._store.increment) {
            throw new Error('Store should have a ".increment()" method.');
        }
    }

    get middleware() {
        return (req, res, next) => {
            if (true === req._skip_limits) {
                next();

                return;
            }

            const max = (req._custom_limits || {}).max || this._max;
            const period = (req._custom_limits || {}).period || this._period;

            let identifier = this._identifier;

            if ('function' === typeof this._identifier) {
                identifier = this._identifier(req);
            }

            const limit = Date.now() + period;
            const key = this._prefix + req.url + '-' + identifier;

            this._store.increment(key, limit, ({
                                                   current = 1,
                                                   reset = limit
                                               } = {}, error) => {
                if (error) {
                    return next(error);
                }

                // Max limit reached
                if (current > max) {
                    const err = new Error(this._message);
                    err.status = this._status;
                    return next(err);
                }

                try {
                    res.header(this._headers.remaining, Math.floor(max - current));
                    res.header(this._headers.limit, max);
                    res.header(this._headers.reset, reset);
                } catch (err) {
                    return next(err);
                }


                next();
            });
        };
    }
}


module.exports = RateLimiter;
