# RRNL-request-limiter-middleware

A RRNL middleware for limit number of request

[![GitHub Repo stars](https://img.shields.io/github/stars/xyy94813/rrnl-request-limiter-middleware?label=github%20%20stars)](https://github.com/xyy94813/rrnl-request-limiter-middleware)
[![last commit (branch)](https://img.shields.io/github/last-commit/xyy94813/rrnl-request-limiter-middleware/main)](https://github.com/xyy94813/rrnl-request-limiter-middleware)

[![latest version](https://img.shields.io/npm/v/rrnl-request-limiter-middleware.svg?label=latest%20%20version)](https://www.npmjs.org/package/rrnl-request-limiter-middleware)
[![License](https://img.shields.io/npm/l/rrnl-request-limiter-middleware?label=latest%20%20version%20%20license)](https://www.npmjs.org/package/rrnl-request-limiter-middleware)
[![npm downloads](https://img.shields.io/npm/dm/rrnl-request-limiter-middleware.svg)](http://npmjs.com/rrnl-request-limiter-middleware)
[![minimized gzipped size](https://img.shields.io/bundlejs/size/rrnl-request-limiter-middleware)](http://npmjs.com/rrnl-request-limiter-middleware)

[![Codecov workflow](https://github.com/xyy94813/rrnl-request-limiter-middleware/actions/workflows/codecov.yml/badge.svg?branch=main)](https://github.com/xyy94813/rrnl-request-limiter-middleware/actions/workflows/codecov.yml)
[![codecov](https://codecov.io/gh/xyy94813/rrnl-request-limiter-middleware/branch/main/graph/badge.svg?token=DCC845JGZW)](https://codecov.io/gh/xyy94813/rrnl-request-limiter-middleware)

## Why need this middleware?

Adding loose limits on the number of requests prevents applications from generating a large number of server requests in a short period of time,
thus ultimately avoiding more serious problems

Despite the rigorous testing of our products, bugs that can't be reproduced are always there.

Despite our caching strategy. (with `React-Relay` cache policy or cache middleware)

### Inexperienced developers can easily make the following mistakes

```js
const res = useLazyLoadQuery(query, {
  startDateTime: moment().subtract(7, "day").format("l HH:mm:ss"), // last 7 day
});
```

Think about this: "If the request time is large then 1 second?"

The precision of the time parameter in variables is small, it is more likely to result in frequent requests.

## How to use?

Install:

```shell
yarn add rrnl-request-limiter-middleware

// or npm install rrnl-request-limiter-middleware
```

Usage:

```js
import {
  createRequestLimiterMiddleware,
  SlidingLogRateLimiter,
} from "rrnl-request-limiter-middleware";

const network = new RelayNetworkLayer([
  // your other middleware
  // ...
  cacheMiddleware(),
  createRequestLimiterMiddleware(
    new SlidingLogRateLimiter([
      { duration: 60_000, limitTimes: 60 }, // Maximum 60 requests in 60 second for a query id
      { duration: 1_000, limitTimes: 3 }, // Maximum 3 requests in 1 second for a query id
    ]),
  ),
  // your other middlewares
  // ...
]);
```

Use with `TokenBucketRateLimiter`:

```js
import {
  createRequestLimiterMiddleware,
  TokenBucketRateLimiter,
} from "rrnl-request-limiter-middleware";

const network = new RelayNetworkLayer([
  // your other middleware
  // ...
  cacheMiddleware(),
  createRequestLimiterMiddleware(new TokenBucketRateLimiter(20, 1)),
  // your other middlewares
  // ...
]);
```

**NOTE: Currently, `TokenBucketRateLimiter` does not distinguish between queryId limits, in order to avoid overly timed tasks.**

With `wait` limit policy:

```js
import {
  createRequestLimiterMiddleware,
  TokenBucketRateLimiter,
} from "rrnl-request-limiter-middleware";

const network = new RelayNetworkLayer([
  // your other middleware
  // ...
  cacheMiddleware(),
  createRequestLimiterMiddleware(new TokenBucketRateLimiter(20, 1), "wait"),
  // your other middlewares
  // ...
]);
```

## How to contribute?

[Contributing Guild](https://github.com/xyy94813/rrnl-request-limiter-middleware/blob/main/Contributing.md)

## Changelog

[Change Logs](https://github.com/xyy94813/rrnl-request-limiter-middleware/blob/main/CHANGELOG.md)

## License

[MIT](https://github.com/xyy94813/rrnl-request-limiter-middleware/blob/main/LICENSE)
