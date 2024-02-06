import {
  type Middleware,
  type MiddlewareNextFn,
  type RelayRequestAny
} from 'react-relay-network-modern'

import { type RateLimiter, type LimitPolicy } from './interface'
import SlidingLogRateLimiter, { type TimeWindow } from './SlidingLogRateLimiter'

const createReqLimitedMiddleware = (input: RateLimiter | TimeWindow[], limitPolicy: LimitPolicy = 'reject'): Middleware => {
  let limiter: RateLimiter
  if (Array.isArray(input)) {
    // Compatible with old inputs,
    // transform to SlidingLogRateLimiter
    limiter = new SlidingLogRateLimiter(input)
  } else {
    limiter = input
  }

  return (next: MiddlewareNextFn) => async (req: RelayRequestAny) => {
    await limiter.tryLimit(req, limitPolicy)

    return await next(req)
  }
}

export default createReqLimitedMiddleware
