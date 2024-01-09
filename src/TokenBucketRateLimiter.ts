import { type RelayRequestAny, RRNLRequestError } from 'react-relay-network-modern'

import { type RateLimiter } from './interface'
import TokenBucket from './TokenBucket'

class TokenBucketRateLimiter implements RateLimiter {
  private readonly bucket: TokenBucket

  /**
   * Constructs a new instance of the class.
   *
   * @param {number} maxSize - The maximum size of the token bucket.
   * @param {number} duration - The duration in milliseconds for the token bucket to refill.
   * @param {number} [addonSize] - An optional additional size for the token bucket.
   */
  constructor (maxSize: number, duration: number, addonSize?: number) {
    this.bucket = new TokenBucket(maxSize, duration, addonSize)
  }

  private readonly executeLimit = (req: RelayRequestAny): any => {
    const error = new RRNLRequestError(
          `Relay request for '${req.getID()}' failed by 'too many requests'`
    )
    error.req = req
    throw error
  }

  tryLimit = (req: RelayRequestAny): void => {
    try {
      this.bucket.customToken()
    } catch (error) {
      this.executeLimit(req)
    }
  }
}

export default TokenBucketRateLimiter
