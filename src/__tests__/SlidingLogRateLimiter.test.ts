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

    test('auto clear record should be work', async () => {
      jest.spyOn(globalThis, 'setInterval')

      // eslint-disable-next-line no-new
      new SlidingLogRateLimiter([
        { duration: 1_00, limitTimes: 1 },
        { duration: 2_00, limitTimes: 1 }
      ])

      expect(globalThis.setInterval).toHaveBeenCalledWith(expect.any(Function), 200)

      await sleep(1_000)
      // TODO: validate clearRecord should be work correct
    })
  })

  describe('method `tryLimit`', () => {
    test('should allow the request if it is within the limit', async () => {
      const limiter = new SlidingLogRateLimiter([
        { duration: 1_000, limitTimes: 2 },
        { duration: 5_000, limitTimes: 5 }
      ])

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).resolves.toBe(undefined)
    })

    test('when use `reject` policy, should throw an error if the request exceeds the limit', async () => {
      const limiter = new SlidingLogRateLimiter([
        { duration: 1_00, limitTimes: 1 }
      ])

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).resolves.toBe(undefined)

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).rejects.toThrow(RRNLRequestError)

      await sleep(1_00)

      await expect(limiter.tryLimit(createMockRequest() as RelayRequestAny, 'reject')).resolves.toBe(undefined)
    })

    test('when use `wait` policy, lazy execute if the request exceeds the limit', async () => {
      const limiter = new SlidingLogRateLimiter([
        { duration: 1_00, limitTimes: 1 }
      ])

      const promise1 = limiter.tryLimit(createMockRequest() as RelayRequestAny, 'wait')
      const promise2 = limiter.tryLimit(createMockRequest() as RelayRequestAny, 'wait')
      await sleep(1_00)
      const promise3 = limiter.tryLimit(createMockRequest() as RelayRequestAny, 'wait')

      const promise1WithOutput = promise1.then(() => 1)
      const promise2WithOutput = promise2.then(() => 2)
      const promise3WithOutput = promise3.then(() => 3)

      const raceBefore1And2 = Promise.race([
        promise1WithOutput,
        promise2WithOutput
      ])
      const raceBefore2And3 = Promise.race([
        promise2WithOutput,
        promise3WithOutput
      ])

      // should be FIFO
      await expect(raceBefore1And2).resolves.toBe(1)
      await expect(raceBefore2And3).resolves.toBe(2)

      // all should be success
      await expect(promise1).resolves.toBe(undefined)
      await expect(promise2).resolves.toBe(undefined)
      await expect(promise3).resolves.toBe(undefined)
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
