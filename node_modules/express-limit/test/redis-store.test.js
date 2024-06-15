"use strict";

// Initialize Redis
const redis = require("redis");
const client = redis.createClient();

const RedisStore = require("../src/redis-store");

beforeAll(function () {
  return client.connect();
});

afterAll(function () {
  return client.disconnect();
});

test("RedisStore - Test increment", function (done) {
  const key = "test-1";
  const reset = Date.now() + 1000;
  const rateLimitStore = new RedisStore(client);

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

test("RedisStore - Test increment expiration", function (done) {
  const key = "test-2";
  const reset = Date.now() + 1000;
  const rateLimitStore = new RedisStore(client);

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
