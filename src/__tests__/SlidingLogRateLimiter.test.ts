import { type RelayRequestAny, RRNLRequestError } from 'react-relay-network-modern'

import SlidingLogRateLimiter from '../SlidingLogRateLimiter'

import sleep from '../sleep'

const createMockRequest = (): any => ({
  getID: jest.fn(() => 'testQueryId'),
  fetchOpts: {
    method: 'POST',
    body: undefined,
    headers: {}
  }
})

describe('SlidingLogRateLimiter', () => {
  describe('constructor', () => {
    test('wrong input', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new SlidingLogRateLimiter([])
      }).toThrow('time window list can not be empty')
    })

    test('should throw an error if the request exceeds the limit', async () => {
      const limiter = new SlidingLogRateLimiter([
        { duration: 1_00, limitTimes: 1 }
      ])

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).not.toThrow()

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).toThrow(RRNLRequestError)

      await sleep(1_00)

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).not.toThrow()
    })
  })

  describe('method `tryLimit`', () => {
    test('should allow the request if it is within the limit', () => {
      const limiter = new SlidingLogRateLimiter([
        { duration: 1_000, limitTimes: 2 },
        { duration: 5_000, limitTimes: 5 }
      ])

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).not.toThrow()
    })

    test('should throw an error if the request exceeds the limit', async () => {
      const limiter = new SlidingLogRateLimiter([
        { duration: 1_00, limitTimes: 1 }
      ])

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).not.toThrow()

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).toThrow(RRNLRequestError)

      await sleep(1_00)

      expect(() => {
        limiter.tryLimit(createMockRequest() as RelayRequestAny)
      }).not.toThrow()
    })
  })

  describe('static method `validateTimeWindow`', () => {
    test('duration is not a number', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        SlidingLogRateLimiter.validateTimeWindow({ duration: '1', limitTimes: 1 } as any)
      }).toThrow('Request limiter duration must be number')
    })

    test('limitTimes is not a number', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        SlidingLogRateLimiter.validateTimeWindow({ duration: 1, limitTimes: '1' } as any)
      }).toThrow('Request limiter limitTimes must be number')
    })
  })

  describe('static method `validateTimeWindows` ', () => {
    test('empty limiters', () => {
      expect(() => {
        SlidingLogRateLimiter.validateTimeWindows([])
      }).toThrow('time window list can not be empty')
    })

    test('repeated limiters duration', () => {
      expect(() => {
        SlidingLogRateLimiter.validateTimeWindows([
          { duration: 1, limitTimes: 1 },
          { duration: 1, limitTimes: 100 }
        ])
      }).toThrow('Duration \'1\' is repeated')
    })
  })
})
