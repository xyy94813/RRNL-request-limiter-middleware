type TokenBucketObserver = () => void
type TokenBucketObserverDispose = () => void

class TokenBucket {
  private readonly maxSize: number
  private tokens: number // don't need to generate token, because we don't need consider concurrency in js
  private readonly addonSize: number
  private readonly tokenGeneratedObserverList = new Set<TokenBucketObserver>()
  /**
   * Constructs a new instance of the class.
   *
   * @param {number} maxSize - The maximum size.
   * @param {number} duration - The duration (ms).
   * @param {number} [addonSize] - The addon size.
   */
  constructor (maxSize: number, duration: number, addonSize?: number) {
    if (maxSize <= 0) {
      throw new Error('`maxSize` must be greater than 0')
    }

    if (duration <= 0) {
      throw new Error('`duration` must be greater than 0')
    }

    if (typeof addonSize === 'number' && addonSize <= 0) {
      throw new Error('`addonSize` must be greater than 0')
    }

    this.maxSize = Math.max(0, maxSize)
    this.tokens = this.maxSize
    this.addonSize = addonSize ?? this.maxSize

    // TODO: if bucket is not used. when to clear interval?
    setInterval(this.generateTokens, duration)
  }

  private readonly generateTokens = (): this => {
    this.tokens = Math.min(this.tokens + this.addonSize, this.maxSize)
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/forEach
    // with insert order
    this.tokenGeneratedObserverList.forEach((observer) => { observer() })
    return this
  }

  readonly customToken = (): this => {
    if (this.tokens <= 0) {
      throw Error('token has been consumed')
    }

    this.tokens -= 1

    return this
  }

  readonly onTokenGenerated = (observer: TokenBucketObserver): TokenBucketObserverDispose => {
    this.tokenGeneratedObserverList.add(observer)
    const dispose: TokenBucketObserverDispose = () => {
      this.tokenGeneratedObserverList.delete(observer)
    }
    return dispose
  }
}

export default TokenBucket
