import defaultExport, {
  createRequestLimiterMiddleware,
  SlidingLogRateLimiter,
  TokenBucketRateLimiter
} from '../index'

describe('entry file `index.ts`', () => {
  test('default is `createReqLimitedMiddleware`', () => {
    expect(defaultExport).toBe(createRequestLimiterMiddleware)
  })

  test('createReqLimitedMiddleware is exported', () => {
    expect(createRequestLimiterMiddleware).not.toBe(undefined)
  })

  test('SlidingLogRateLimiter is exported', () => {
    expect(SlidingLogRateLimiter).not.toBe(undefined)
  })

  test('TokenBucketRateLimiter is exported', () => {
    expect(TokenBucketRateLimiter).not.toBe(undefined)
  })
})
