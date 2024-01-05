import {
  RRNLRequestError,
  type RelayNetworkLayerRequest,
  type Middleware,
  type MiddlewareNextFn,
  type RelayRequestAny
} from 'react-relay-network-modern'

import RequestTimeRecorder from './RequestTimeRecorder'

type RequestTimesLimiter = { duration: number, limitTimes: number }

const validateLimiter = (limiter: RequestTimesLimiter): void => {
  if (typeof limiter.duration !== 'number') {
    throw new Error('Request limiter duration must be number')
  }

  if (typeof limiter.limitTimes !== 'number') {
    throw new Error('Request limiter limitTimes must be number')
  }
}

const validateLimiters = (limiters: RequestTimesLimiter[]): void => {
  if (!Array.isArray(limiters) || limiters.length === 0) {
    throw new Error('No limiter')
  }

  limiters.forEach(validateLimiter)

  // check duration not repeated
  const durations = new Set<number>()
  limiters.forEach((limiter) => {
    if (durations.has(limiter.duration)) {
      throw new Error(`Duration '${limiter.duration}' is repeated`)
    }

    durations.add(limiter.duration)
  })
}

const createReqLimitedMiddleware = (limiters: RequestTimesLimiter[]): Middleware => {
  // validate limiters
  validateLimiters(limiters)

  const recorder = new RequestTimeRecorder()

  return (next: MiddlewareNextFn) => async (req: RelayRequestAny) => {
    const now: number = Date.now()
    const queryId: string = (req as RelayNetworkLayerRequest).getID()

    if (limiters.some(({ duration, limitTimes }) => recorder.getRequestTimes(queryId, duration) >= limitTimes)) {
      const error = new RRNLRequestError(
        `Relay request for '${req.getID()}' failed by 'too many requests'`
      )
      error.req = req
      throw error
    }

    recorder.saveRecord(queryId, now)

    return await next(req)
  }
}

export default createReqLimitedMiddleware
