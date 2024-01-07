/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  RRNLRequestError,
  type MiddlewareNextFn
} from 'react-relay-network-modern'

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
  test('wrong limiter', () => {
    expect(() => {
      createReqLimitedMiddleware([
        { duration: '1', limitTimes: 1 } as any
      ])
    }).toThrow('Request limiter duration must be number')

    expect(() => {
      createReqLimitedMiddleware([
        { duration: 1, limitTimes: '1' } as any
      ])
    }).toThrow('Request limiter limitTimes must be number')
  })

  test('empty limiters', () => {
    expect(() => {
      createReqLimitedMiddleware([])
    }).toThrow('No limiter')
  })

  test('repeated limiters duration', () => {
    expect(() => {
      createReqLimitedMiddleware([
        { duration: 1, limitTimes: 1 },
        { duration: 1, limitTimes: 100 }
      ])
    }).toThrow('Duration \'1\' is repeated')
  })

  test('normal request', async () => {
    const limiters = [{ duration: 1_000, limitTimes: 3 }]
    const middleware = createReqLimitedMiddleware(limiters)

    const next: MiddlewareNextFn = jest.fn().mockResolvedValue({})
    const req: any = createMockReq()

    const result = await middleware(next)(req)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(req)
    expect(result).toEqual({})
  })

  test('trigger limiter error', async () => {
    const limiters = [{ duration: 200, limitTimes: 2 }]
    const middleware = createReqLimitedMiddleware(limiters)

    const next = jest.fn().mockResolvedValue({})
    const req: any = createMockReq()

    await middleware(next)(req)
    await middleware(next)(req)

    // The promise should be rejected when the limit is exceeded
    await expect(middleware(next)(req)).rejects.toThrow(RRNLRequestError)

    // after 1 seconds, should be ok
    await new Promise(resolve => globalThis.setTimeout(resolve, 200))
    const result = await middleware(next)(req)
    expect(result).toEqual({})
  })
})
