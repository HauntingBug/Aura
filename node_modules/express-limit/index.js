const RateLimiter = require("./src/rate-limiter");
const InMemoryStore = require("./src/in-memory-store");
const RedisStore = require("./src/redis-store");
const RedisLegacyStore = require("./src/redis-legacy-store");

module.exports = {
  RateLimiter,
  InMemoryStore,
  RedisStore,
  RedisLegacyStore,
  limit: function (options) {
    "use strict";

    return new RateLimiter(options).middleware;
  },
};
