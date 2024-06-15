"use strict";

const RateLimiter = require("../src/rate-limiter");

const express = require("express");
const request = require("supertest");

const app = express();

const rateLimiter = new RateLimiter({
  max: 5,
  period: 1000,
});

let skipLimits = false;
let customLimits = false;

app.get(
  "/test",
  function (req, res, next) {
    if (true === skipLimits) {
      req._skip_limits = true;
    }

    if (true === customLimits) {
      req._custom_limits = {
        max: 50,
        period: 2000,
      };
    }

    next();
  },
  rateLimiter.middleware,
  function (req, res) {
    res.status(200).json({ test: "OK" });
  }
);

test("RateLimiter - Test limits OK", function (done) {
  let counter = 0;

  for (let i = 1; i <= 5; i++) {
    request(app)
      .get("/test")
      .expect("Content-Type", /json/)
      .expect("X-RateLimit-Remaining", String(Math.floor(5 - i)))
      .expect("X-RateLimit-Limit", String(5))
      .expect(200)
      .then((response) => {
        expect(response.body.test).toEqual("OK");
        counter++;

        if (5 === counter) {
          done();
        }
      });
  }
});

test("RateLimiter - Test limits KO", function (done) {
  request(app)
    .get("/test")
    .expect(429, () => {
      setTimeout(done, 1000);
    });
});

test("RateLimiter - Test skip limits", function (done) {
  skipLimits = true;

  let counter = 0;

  for (let i = 1; i <= 50; i++) {
    request(app)
      .get("/test")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.test).toEqual("OK");

        counter++;

        if (50 === counter) {
          skipLimits = false;

          done();
        }
      });
  }
});

test("RateLimiter - Test custom limits OK", function (done) {
  customLimits = true;

  let counter = 0;

  for (let i = 1; i <= 50; i++) {
    request(app)
      .get("/test")
      .expect("Content-Type", /json/)
      .expect(200)
      .end((_, response) => {
        expect(response.body.test).toEqual("OK");

        counter++;

        if (50 === counter) {
          done();
        }
      });
  }
});

test("RateLimiter - Test custom limits KO", function (done) {
  request(app)
    .get("/test")
    .expect(429, () => {
      customLimits = false;

      setTimeout(done, 2000);
    });
});

test("RateLimiter - Key name", function (done) {
  expect(
    typeof rateLimiter._store._storage["rate-limit-/test-::ffff:127.0.0.1"]
  ).toEqual("object");

  done();
});

test("RateLimiter - Test handling error within store", function (done) {
  class ErrorStore {
    increment(key, reset, callback) {
      callback({}, new Error("Error thrown by store"));
    }
  }

  const errorRateLimiter = new RateLimiter({
    store: new ErrorStore(),
  });

  app.get(
    "/test-store-error",
    errorRateLimiter.middleware,
    function (req, res) {
      res.status(200).json({ test: "OK" });
    }
  );

  request(app).get("/test-store-error").expect(500, done);
});

test("RateLimiter - Test handling async error", function (done) {
  class AsyncStore {
    increment(key, reset, callback) {
      setTimeout(function () {
        callback({ reset: reset, current: 1 });
      }, 1000);
    }
  }
  const asyncRateLimiter = new RateLimiter({
    store: new AsyncStore(),
  });

  let propagatedError = {};

  app.get(
    "/test-header-error",
    function (req, res, next) {
      res.status(200).json({ test: "OK" });
      next();
    },
    asyncRateLimiter.middleware,
    function (error, req, res, next) {
      if (error) {
        propagatedError = error;
        return;
      }
      res.status(204).send();
    }
  );

  request(app)
    .get("/test-header-error")
    .expect(200)
    .end((_, response) => {
      expect(response.body.test).toEqual("OK");

      setTimeout(function () {
        expect(propagatedError.code).toEqual("ERR_HTTP_HEADERS_SENT");

        done();
      }, 2000);
    });
});
