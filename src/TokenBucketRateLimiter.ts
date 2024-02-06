import { type RelayRequestAny, RRNLRequestError } from 'react-relay-network-modern'

import { type RateLimiter, type LimitPolicy } from './interface'
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

  private readonly throwRejectError = (req: RelayRequestAny): void => {
    const error = new RRNLRequestError(
      `Relay request for '${req.getID()}' failed by 'too many requests'`
    )
    error.req = req
    throw error
  }

  private readonly waitNextTokenGenerated = async (): Promise<void> => {
    await new Promise(resolve => {
      const dispose = this.bucket.onTokenGenerated(() => {
        resolve(undefined)
        dispose() // unsubscribe
      })
    })
  }

  tryLimit = async (req: RelayRequestAny, limitPolicy: LimitPolicy): Promise<void> => {
    try {
      this.bucket.customToken()
    } catch (error) {
      if (limitPolicy === 'reject') {
        this.throwRejectError(req)
      }

      // await next token generated
      await this.waitNextTokenGenerated()
      // retry custom token
      await this.tryLimit(req, limitPolicy)
    }
  }
}

export default TokenBucketRateLimiter
