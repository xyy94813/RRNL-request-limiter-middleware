import { type RelayNetworkLayerRequest, type RelayRequestAny, RRNLRequestError } from 'react-relay-network-modern'

import { type RateLimiter } from './interface'
import RequestTimeRecorder from './RequestTimeRecorder'

export type TimeWindow = { duration: number, limitTimes: number }

class SlidingLogRateLimiter implements RateLimiter {
  private readonly timeWindows: TimeWindow[]
  private readonly recorder: RequestTimeRecorder

  constructor (timeWindows: TimeWindow[]) {
    SlidingLogRateLimiter.validateTimeWindows(timeWindows)

    this.timeWindows = timeWindows
    this.recorder = new RequestTimeRecorder()
  }

  private readonly isAllow = (req: RelayRequestAny): boolean => {
    const now: number = Date.now()
    const queryId: string = (req as RelayNetworkLayerRequest).getID()

    return this.timeWindows.every(({ duration, limitTimes }) => this.recorder.getRequestTimes(queryId, now - duration) < limitTimes)
  }

  private readonly executeLimit = (req: RelayRequestAny): any => {
    const error = new RRNLRequestError(
          `Relay request for '${req.getID()}' failed by 'too many requests'`
    )
    error.req = req
    throw error
  }

  tryLimit = (req: RelayRequestAny): void => {
    const now: number = Date.now()
    const queryId: string = (req as RelayNetworkLayerRequest).getID()

    if (!this.isAllow(req)) {
      this.executeLimit(req)
    }

    this.recorder.saveRecord(queryId, now)
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
