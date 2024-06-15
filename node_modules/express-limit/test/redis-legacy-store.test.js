"use strict";

// Initialize Redis
const redis = require("redis");
const client = redis.createClient({
  legacyMode: true,
});

const RedisLegacyStore = require("../src/redis-legacy-store");

beforeAll(function () {
  return client.connect();
});

afterAll(function () {
  return client.disconnect();
});

test("RedisLegacyStore - Test increment", function (done) {
  const key = "legacy-test-1";
  const reset = Date.now() + 1000;
  const rateLimitStore = new RedisLegacyStore(client);

  rateLimitStore.increment(key, reset, (limits) => {
    expect(limits.current).toEqual(1);
    expect(limits.reset).toEqual(reset);

    rateLimitStore.increment(key, reset, (limits) => {
      expect(limits.current).toEqual(2);
      expect(limits.reset).toEqual(reset);

      done();
    });
  });
});

test("RedisLegacyStore - Test increment expiration", function (done) {
  const key = "legacy-test-2";
  const reset = Date.now() + 1000;
  const rateLimitStore = new RedisLegacyStore(client);

  rateLimitStore.increment(key, reset, (limits) => {
    expect(limits.current).toEqual(1);
    expect(limits.reset).toEqual(reset);

    rateLimitStore.increment(key, reset, (limits) => {
      expect(limits.current).toEqual(2);
      expect(limits.reset).toEqual(reset);

      setTimeout(() => {
        rateLimitStore.increment(key, reset + 1000, (limits) => {
          expect(limits.current).toEqual(1);
          expect(limits.reset).toEqual(reset + 1000);

          done();
        });
      }, 1500);
    });
  });
});
