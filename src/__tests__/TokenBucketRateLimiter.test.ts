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
    test('should throw an error if token has been consumed', async () => {
      const limiter = new TokenBucketRateLimiter(1, 50)
      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).not.toThrow()

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).toThrow(RRNLRequestError)
    })

    test('should be success after regenerate tokens', async () => {
      const limiter = new TokenBucketRateLimiter(1, 50)
      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).not.toThrow()

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).toThrow(RRNLRequestError)

      await sleep(70)

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).not.toThrow()
    })
  })
})
