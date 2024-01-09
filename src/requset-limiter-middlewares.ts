import {
  type Middleware,
  type MiddlewareNextFn,
  type RelayRequestAny
} from 'react-relay-network-modern'

import { type RateLimiter } from './interface'
import SlidingLogRateLimiter, { type TimeWindow } from './SlidingLogRateLimiter'

const createReqLimitedMiddleware = (input: RateLimiter | TimeWindow[]): Middleware => {
  let limiter: RateLimiter
  if (Array.isArray(input)) {
    // Compatible with old inputs,
    // transform to SlidingLogRateLimiter
    limiter = new SlidingLogRateLimiter(input)
  } else {
    limiter = input
  }

  return (next: MiddlewareNextFn) => async (req: RelayRequestAny) => {
    limiter.tryLimit(req)

    return await next(req)
  }
}

export default createReqLimitedMiddleware
