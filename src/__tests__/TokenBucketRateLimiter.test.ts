import { type RelayRequestAny, RRNLRequestError } from 'react-relay-network-modern'

import TokenBucketRateLimiter from '../TokenBucketRateLimiter'
import sleep from '../sleep'

const createMockRequest = (): any => ({
  getID: jest.fn(() => 'testQueryId'),
  fetchOpts: {
    method: 'POST',
    body: undefined,
    headers: {}
  }
})

describe('TokenBucketRateLimiter', () => {
  describe('method `tryLimit`', () => {
    test('When use `reject` policy, should throw an error if token has been consumed', async () => {
      const limiter = new TokenBucketRateLimiter(1, 50)

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).resolves.toBe(undefined)

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).rejects.toThrow(RRNLRequestError)
    })

    test('When use `reject` policy, should be success after regenerate tokens', async () => {
      const limiter = new TokenBucketRateLimiter(1, 50)

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).resolves.toBe(undefined)

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).rejects.toThrow(RRNLRequestError)

      await sleep(70)

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).resolves.toBe(undefined)
    })

    test('When use `wait` policy, lazy execute and should success after regenerate tokens', async () => {
      const limiter = new TokenBucketRateLimiter(1, 50)

      const promise1 = limiter.tryLimit(createMockRequest() as RelayRequestAny, 'wait')
      const promise2 = limiter.tryLimit(createMockRequest() as RelayRequestAny, 'wait')
      const promise3 = limiter.tryLimit(createMockRequest() as RelayRequestAny, 'wait')

      const promise1WithOutput = promise1.then(() => 1)
      const promise2WithOutput = promise2.then(() => 2)
      const promise3WithOutput = promise3.then(() => 3)
      // should be FIFO
      await expect(Promise.race([
        promise1WithOutput,
        promise2WithOutput
      ])).resolves.toBe(1)
      await expect(Promise.race([
        promise2WithOutput,
        promise3WithOutput
      ])).resolves.toBe(2)

      // all should be success
      await expect(promise1).resolves.toBe(undefined)
      await expect(promise2).resolves.toBe(undefined)
      await expect(promise3).resolves.toBe(undefined)
    })
  })
})
