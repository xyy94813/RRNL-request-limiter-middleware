import RequestTimeRecorder from '../RequestTimeRecorder'

describe('RequestTimeRecorder', () => {
  let recorder: RequestTimeRecorder

  beforeEach(() => {
    recorder = new RequestTimeRecorder()
  })

  describe('method `saveRecord`', () => {
    test('add request time to store', () => {
      recorder.saveRecord('query1', 100)
      recorder.saveRecord('query1', 200)

      expect(recorder.getRequestTimes('query1', 0)).toBe(2)
    })
  })

  describe('method `getRequestTimes`', () => {
    test('should return the number of request times after a given time', () => {
      recorder.saveRecord('query1', 100)
      recorder.saveRecord('query1', 200)
      recorder.saveRecord('query2', 300)

      expect(recorder.getRequestTimes('query1', 150)).toBe(1)
      expect(recorder.getRequestTimes('query2', 0)).toBe(1)
      expect(recorder.getRequestTimes('query3', 0)).toBe(0)
    })
  })

  describe('method `clearRecords`', () => {
    test('clear all store successfully', () => {
      const now = Date.now()

      recorder.saveRecord('query1', now - 2_000)
      recorder.saveRecord('query2', now - 2_000)
      recorder.saveRecord('query2', now - 1_000)

      recorder.clearRecords(now - 1_500) // 1.5s before

      expect(recorder.getRequestTimes('query1', now - 3_000)).toBe(0) // after 1.5s
      expect(recorder.getRequestTimes('query2', now - 1_500)).toBe(1) // after 1.5s
      expect(recorder.getRequestTimes('query2', now - 1_500)).toBe(1)
    })
  })
})
