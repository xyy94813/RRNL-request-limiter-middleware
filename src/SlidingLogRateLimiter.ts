import { type RelayNetworkLayerRequest, type RelayRequestAny, RRNLRequestError } from 'react-relay-network-modern'

import { type RateLimiter, type LimitPolicy } from './interface'
import RequestTimeRecorder from './RequestTimeRecorder'
import sleep from './sleep'

export type TimeWindow = { duration: number, limitTimes: number }

class SlidingLogRateLimiter implements RateLimiter {
  private readonly timeWindows: TimeWindow[]
  private readonly recorder: RequestTimeRecorder

  constructor (timeWindows: TimeWindow[]) {
    SlidingLogRateLimiter.validateTimeWindows(timeWindows)

    this.timeWindows = timeWindows
    this.recorder = new RequestTimeRecorder()

    const maxDuration = Math.max(...timeWindows.map(({ duration }) => duration))

    // auto clear records for reduce memory
    globalThis.setInterval(() => {
      this.recorder.clearRecords(Date.now() - maxDuration)
    }, maxDuration)
  }

  private readonly isAllow = (queryId: string, newReqTime: number): boolean => {
    return this.timeWindows.every(({ duration, limitTimes }) =>
      this.recorder.getRequestTimes(queryId, newReqTime - duration) < limitTimes
    )
  }

  private readonly getWaitTime = (queryId: string, newReqTime: number): number => {
    return Math.max(
      ...this.timeWindows
      // filter time windows that can be hits
        .filter(({ duration, limitTimes }) =>
          this.recorder.getRequestTimes(queryId, newReqTime - duration) >= limitTimes
        )
        .map(({ duration }) => {
          const start = newReqTime - duration
          const end = newReqTime + 1
          const firstReqTime = this.recorder.getFirstRequestTimeInRange(queryId, start, end)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          return (firstReqTime)! - start
        })
    )
  }

  private readonly throwRejectError = (req: RelayRequestAny): void => {
    const error = new RRNLRequestError(
      `Relay request for '${req.getID()}' failed by 'too many requests'`
    )
    error.req = req
    throw error
  }

  tryLimit = async (req: RelayRequestAny, limitPolicy: LimitPolicy): Promise<void> => {
    const now: number = Date.now()
    const queryId: string = (req as RelayNetworkLayerRequest).getID()

    if (this.isAllow(queryId, now)) {
      this.recorder.saveRecord(queryId, now)
    } else {
      if (limitPolicy === 'reject') {
        this.throwRejectError(req)
      }

      const waitTime = this.getWaitTime(queryId, now)
      await sleep(waitTime)
      await this.tryLimit(req, limitPolicy)
    }
  }

  static validateTimeWindow (timeWindow: TimeWindow): void {
    if (typeof timeWindow.duration !== 'number') {
      throw new Error('Request limiter duration must be number')
    }

    if (typeof timeWindow.limitTimes !== 'number') {
      throw new Error('Request limiter limitTimes must be number')
    }
  }

  static validateTimeWindows (timeWindows: TimeWindow[]): void {
    if (!Array.isArray(timeWindows) || timeWindows.length === 0) {
      throw new Error('time window list can not be empty')
    }

    timeWindows.forEach((timeWindow) => {
      SlidingLogRateLimiter.validateTimeWindow(timeWindow)
    })

    // check duration not repeated
    const durations = new Set<number>()
    timeWindows.forEach((timeWindow) => {
      if (durations.has(timeWindow.duration)) {
        throw new Error(`Duration '${timeWindow.duration}' is repeated`)
      }

      durations.add(timeWindow.duration)
    })
  }
}

export default SlidingLogRateLimiter
