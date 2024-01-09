/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  RRNLRequestError,
  type MiddlewareNextFn
} from 'react-relay-network-modern'

import SlidingLogRateLimiter from '../SlidingLogRateLimiter'
import createReqLimitedMiddleware from '../requset-limiter-middlewares'

const createMockReq = (): any => ({
  getID: jest.fn(() => 'testQueryId'),
  fetchOpts: {
    method: 'POST',
    body: undefined,
    headers: {}
  }
})

describe('createReqLimitedMiddleware', () => {
  test('normal request', async () => {
    const limiter = new SlidingLogRateLimiter([{ duration: 1_000, limitTimes: 3 }])
    const middleware = createReqLimitedMiddleware(limiter)

    const next: MiddlewareNextFn = jest.fn().mockResolvedValue({})
    const req: any = createMockReq()

    const result = await middleware(next)(req)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(req)
    expect(result).toEqual({})
  })

  test('trigger limiter error', async () => {
    const middleware = createReqLimitedMiddleware([{ duration: 200, limitTimes: 2 }])

    const next = jest.fn().mockResolvedValue({})
    const req: any = createMockReq()

    await middleware(next)(req)
    await middleware(next)(req)

    // The promise should be rejected when the limit is exceeded
    await expect(middleware(next)(req)).rejects.toThrow(RRNLRequestError)

    // after 200ms, should be ok
    await new Promise(resolve => globalThis.setTimeout(resolve, 200))
    const result = await middleware(next)(req)
    expect(result).toEqual({})
  })
})
