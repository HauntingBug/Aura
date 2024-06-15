# express-limit [![Build Status](https://travis-ci.org/Dallas62/express-limit.svg?branch=master)](https://travis-ci.org/Dallas62/express-limit)

_express-limit_ is a small project that add rate limitations to your API.

## Installation

```console
npm install --save express-limit
```

## Usage

```js
const limit = require("express-limit").limit;

app.get(
  "/api/users",
  limit({
    max: 5, // 5 requests
    period: 60 * 1000, // per minute (60 seconds)
  }),
  function (req, res) {
    res.status(200).json({});
  }
);
```

## Options

```js
{
  (max = 60), // Maximum request per period
    (period = 60 * 1000), // Period in milliseconds
    (prefix = "rate-limit-"), // Prefix of the key
    (status = 429), // Status code in case of rate limit reached
    (message = "Too many requests"), // Message in case of rate limit reached
    (identifier = (request) => {
      // The identifier function/value of the key (IP by default, could be "req.user.id")
      return request.ip || request.ips; // Read from Default properties
    }),
    (headers = {
      // Headers names
      remaining: "X-RateLimit-Remaining",
      reset: "X-RateLimit-Reset",
      limit: "X-RateLimit-Limit",
    }),
    (store = new Store()); // The storage, default storage: in-memory
}
```

In some cases, you could want to skip the limitation you made for trusted client.
In this case, you can add a special field in the request object:

```js
req._skip_limits = true;
```

Also, you could want to add specific limitations for a special client.
In this case, you can add a special field in the request object:

```js
req._custom_limits = {
  max: 1000, // 1000 requests
  period: 60 * 1000, // per minutes
};
```

Just don't forget where you place this modification! It could be applied for all routes!

## Available Stores

Actually, two stores have been made:

- InMemoryStore (default store, nothing to do)

```js
const RateLimiter = require("express-limit").RateLimiter;
const InMemoryStore = require("express-limit").InMemoryStore;

const store = new InMemoryStore();

const limit = (options = {}) => {
  options.store = store;

  return new RateLimiter(options).middleware;
};

app.get(
  "/api/users",
  limit({
    max: 5, // 5 requests
    period: 60 * 1000, // per minute (60 seconds)
  }),
  function (req, res) {
    res.status(200).json({});
  }
);
```

- RedisStore

```js
const redis = require("redis");
const client = redis.createClient();

const RateLimiter = require("express-limit").RateLimiter;
const RedisStore = require("express-limit").RedisStore;

const store = new RedisStore(client);

const limit = (options = {}) => {
  options.store = store;

  return new RateLimiter(options).middleware;
};

app.get(
  "/api/users",
  limit({
    max: 5, // 5 requests
    period: 60 * 1000, // per minute (60 seconds)
  }),
  function (req, res) {
    res.status(200).json({});
  }
);
```

- RedisLegacyStore (node-redis v3 or node-redis v4 with legacyMode `true`)

```js
const redis = require("redis");
const client = redis.createClient({
  legacyMode: true,
});

const RateLimiter = require("express-limit").RateLimiter;
const RedisLegacyStore = require("express-limit").RedisLegacyStore;

const store = new RedisLegacyStore(client);

const limit = (options = {}) => {
  options.store = store;

  return new RateLimiter(options).middleware;
};

app.get(
  "/api/users",
  limit({
    max: 5, // 5 requests
    period: 60 * 1000, // per minute (60 seconds)
  }),
  function (req, res) {
    res.status(200).json({});
  }
);
```

[Keep in touch!](https://twitter.com/BorisTacyniak)
