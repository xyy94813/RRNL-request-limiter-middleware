import TokenBucket from '../TokenBucket'
import sleep from '../sleep'

describe('TokenBucket', () => {
  describe('constructor', () => {
    test('should throw error if `maxSize` is invalid', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new TokenBucket(-1, 60_000)
      }).toThrow('`maxSize` must be greater than 0')
    })

    test('should throw error if `duration` is invalid', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new TokenBucket(10, -1)
      }).toThrow('`duration` must be greater than 0')
    })

    test('should throw error if `addonSize` is invalid', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new TokenBucket(10, 100, -2)
      }).toThrow('`addonSize` must be greater than 0')
    })

    test('valid `addonSize`', async () => {
      const tokenBucket = new TokenBucket(2, 50, 1)
      expect(() => {
        tokenBucket.customToken()
        tokenBucket.customToken()
      }).not.toThrow(Error)

      expect(() => {
        tokenBucket.customToken()
      }).toThrow('token has been consumed')

      await sleep(70)

      expect(() => {
        tokenBucket.customToken()
      }).not.toThrow(Error)

      expect(() => {
        tokenBucket.customToken()
      }).toThrow('token has been consumed')
    })
  })

  describe('method `customToken`', () => {
    test('consume token after regenerate', async () => {
      const tokenBucket = new TokenBucket(2, 50)

      expect(() => {
        tokenBucket.customToken()
        tokenBucket.customToken()
      }).not.toThrow(Error)

      expect(() => {
        tokenBucket.customToken()
      }).toThrow('token has been consumed')

      await sleep(70)

      expect(() => {
        tokenBucket.customToken()
      }).not.toThrow(Error)
    })
  })

  describe('method `onTokenGenerated`', () => {
    test('success subscribe and dispose', async () => {
      const tokenBucket = new TokenBucket(2, 50)
      const observer = jest.fn()
      const dispose = tokenBucket.onTokenGenerated(observer)
      await sleep(60)
      // should be called after token generated
      expect(observer).toHaveBeenCalledTimes(1)

      dispose() // success dispose
      await sleep(50)
      // should not be called after dispose after token generated
      expect(observer).toHaveBeenCalledTimes(1)
    })
  })
})
